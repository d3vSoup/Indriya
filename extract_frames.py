#!/usr/bin/env python3
"""
extract_frames.py — Extract the best middle frame from each ISL word .MOV video
and save as a .jpg for use in the Indriya ISL visualiser.

Source: ProcessedData_vivit (Kaggle kaushikyh/indian-sign-language-words-with-landmarks)
Output: frontend/isl_gestures/words_vivit/<word>.jpg
"""

import cv2
import os
import sys

SRC_DIR = "/Users/rik_mac/Desktop/SOME_REPO/ProcessedData_vivit"
OUT_DIR = "/Users/rik_mac/Desktop/SOME_REPO/frontend/isl_gestures/words_vivit"

os.makedirs(OUT_DIR, exist_ok=True)

words = sorted(os.listdir(SRC_DIR))
words = [w for w in words if os.path.isdir(os.path.join(SRC_DIR, w)) and not w.startswith('.')]

print(f"Processing {len(words)} words...")

success = []
failed = []

for word in words:
    word_dir = os.path.join(SRC_DIR, word)
    video_files = sorted([
        f for f in os.listdir(word_dir)
        if f.lower().endswith(('.mov', '.mp4', '.avi'))
    ])

    if not video_files:
        print(f"  SKIP {word} — no videos")
        failed.append(word)
        continue

    # Use the first video for the representative frame
    video_path = os.path.join(word_dir, video_files[0])
    out_path = os.path.join(OUT_DIR, f"{word}.jpg")

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"  FAIL {word} — cannot open {video_files[0]}")
        failed.append(word)
        continue

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Extract the middle frame (most representative pose)
    target_frame = max(total_frames // 2, 0)
    cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
    
    ret, frame = cap.read()
    cap.release()

    if not ret or frame is None:
        # Try frame 0 as fallback
        cap2 = cv2.VideoCapture(video_path)
        ret, frame = cap2.read()
        cap2.release()
        if not ret:
            print(f"  FAIL {word} — could not read frame")
            failed.append(word)
            continue

    # Save as JPEG, quality 92
    cv2.imwrite(out_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 92])
    print(f"  OK   {word} → {word}.jpg ({total_frames} frames, used #{target_frame})")
    success.append(word)

print(f"\n✅ Extracted: {len(success)}/{len(words)} words")
if failed:
    print(f"❌ Failed:    {failed}")

# Print the complete list for isl-dict.js mapping
print("\n--- WORD LIST FOR isl-dict.js ---")
for w in success:
    print(f"  '{w.upper()}': '{w}.jpg',")
