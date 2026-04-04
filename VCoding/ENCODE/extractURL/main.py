# 2️⃣ Install yt‑dlp

# Open Command Prompt and run:

# pip install yt-dlp
# 3️⃣ Extract Playlist Data

# Run this command:
#  yt-dlp --flat-playlist --print "%(title)s | https://www.youtube.com/watch?v=%(id)s" Playlist url        (      ..cancle everything after & incluting & )

#  yt-dlp --flat-playlist --print "%(title)s | https://www.youtube.com/watch?v=%(id)s" https://youtube.com/playlist?list=PLTPUhMtsiAatgHqKWtni7UMzfbxGDK4iL
# Example using your playlist:

# yt-dlp --flat-playlist --print "%(title)s | https://www.youtube.com/watch?v=%(id)s" https://youtube.com/playlist?list=PLOgzoHFjWOqP6TWGjMZyuI3jowTMuRd3_
# 4️⃣ Output You Will Get

# It will print something like:

# Surah Al‑Baqarah Introduction | https://www.youtube.com/watch?v=abc123
# Surah Al‑Baqarah Verses 1‑5 | https://www.youtube.com/watch?v=def456
