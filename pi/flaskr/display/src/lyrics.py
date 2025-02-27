import requests

import threading
import pyaudio
import wave
import time
from flaskr.display.src.display import show_text

# Audio parameters
FORMAT = pyaudio.paInt16    # Audio format (16-bit)
CHANNELS = 1                # Mono channel
RATE = 44100                # Sampling rate (44.1 kHz)
CHUNK = 1024                # Buffer size
SECONDS = 5                 # Seconds of audio to retain

# Set Genius API key
# GENIUS = lyricsgenius.Genius("ShGRYCfN2TXrPT3B3QCRv_e6ov1hoWptPnvgkc3Juw-4NsOTWPWbYfewDwd3fYjN", remove_section_headers=True)


def save_song(frames, samplewidth):
    wf = wave.open('recording.wav', 'wb')
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(samplewidth)
    wf.setframerate(RATE)
    wf.writeframes(b''.join(frames))
    wf.close()

def fetch_lyrics_with_timestamps(title, artist):
    response = requests.post(f"https://api.textyl.co/api/lyrics?q={'%20'.join(artist.lower().split())}%20{'%20'.join(title.lower().split())}", verify=False)

    if response.status_code == 200:
        lyrics = response.json()
        return lyrics
    return None

def hyphenate_words(line, max_length = 7):
    """
    Hyphenates words in a line of lyrics if they exceed the maximum length.
    """
    words = line.split()
    hyphenated_line = ""
    for word in words:
        if len(word) > max_length:
            hyphenated_word = ""
            for i in range(0, len(word), max_length):
                hyphenated_word += word[i:i + max_length] + "-\n"
            hyphenated_line += hyphenated_word[:-1] + " "
        else:
            hyphenated_line += word + " "
    return hyphenated_line

def display_lyrics_with_timestamps(lyrics, start_time):
    """
    Synchronizes and displays the current and next lyrics with timestamps.
    """
    print('start:', start_time)
    prev_time = start_time

    for i, line in enumerate(lyrics):
        timestamp = line['seconds']
        current_text = line['lyrics']
        current_text = hyphenate_words(current_text)
        if i + 1 < len(lyrics):
            next_text = "\n" + lyrics[i + 1]['lyrics'] # new line between current and next lyrics
        else:
            next_text = ""
        next_text = hyphenate_words(next_text)

        # Wait until the correct time to display the lyric
        if timestamp - prev_time < 0:
            print('>', current_text)
            continue

        combined_text = f"{current_text}\n{next_text}"
        print('>', current_text)  # Display the lyric
        show_text(combined_text, True)
        if (timestamp - prev_time - 0.6 > 0): time.sleep(timestamp - prev_time - 0.6)

        prev_time = timestamp


def findSongAndLyrics():
    print("Recording...")

    # Setup for audio stream
    p = pyaudio.PyAudio()
    stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)

    frames = []
    out = None

    for seconds in range(10):
        for _ in range(0, int(RATE / CHUNK)):
            data = stream.read(CHUNK)
            frames.append(data)

        save_song(frames, p.get_sample_size(FORMAT))

        # Send audio to Shazam
        with open('./recording.wav', 'rb') as fp:
            res = requests.post('https://boss-previously-grubworm.ngrok-free.app/recognize_song', files={'recording.wav': fp.read()})
            out = res.json()
            if out["matches"]:
                break

    stream.close()
    p.terminate()

    if out and out["matches"]:
        track = out['track']
        print(f'"{track["title"]} by {track["subtitle"]}" found in {seconds} seconds!')

        # Fetch lyrics with timestamps
        lyrics = fetch_lyrics_with_timestamps(track['title'], track['subtitle'])
        if lyrics:
            t = threading.Thread(target=display_lyrics_with_timestamps, args=[lyrics, out['matches'][0]['offset'] + seconds])
            t.setDaemon(False)
            t.start()
        else:
            print("Lyrics with timestamps not found.")
        
        print(lyrics)

        return {
            'artist': track['subtitle'],
            'title': track['title'],
            'lyrics': lyrics,
            'songFound': True
        }

    return {'songFound': False}


# def findSongAndLyrics():
#     print("Recording...")

#     # Setup for audio stream
#     p = pyaudio.PyAudio()
#     stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)

#     frames = []

#     for seconds in range(10):
#         for _ in range(0, int(RATE / CHUNK)):
#             data = stream.read(CHUNK)
#             frames.append(data)

#         save_song(frames, p.get_sample_size(FORMAT))

#         # Send audio to Shazam
#         with open('./recording.wav', 'rb') as fp:
#             res = requests.post('https://boss-previously-grubworm.ngrok-free.app/recognize_song', files={ 'recording.wav': fp.read() })
#             out = res.json()
#             if out["matches"]: break


#     stream.close()
#     p.terminate()

#     if out["matches"]:
#         track = out['track']
#         print(f'"{track["title"]} by {track["subtitle"]}" found in {seconds} seconds!')
#         song = GENIUS.search_song(track['title'], track['subtitle'])
#         print(song)

#         return {
#             'artist': track['subtitle'],
#             'title': track['title'],
#             'lyrics': song.lyrics[0:-6],             # Remove embed from end of lyrics string
#             'songFound': True
#         }
    
#     return { 'songFound': False }
