"""Retarget the supplied clip's motion without copying its character artwork."""
import argparse
import json
import math
from pathlib import Path

import cv2
import numpy as np


def extract(video, output):
    capture = cv2.VideoCapture(str(video))
    if not capture.isOpened():
        raise ValueError("Cannot open the reference video")
    fps = capture.get(cv2.CAP_PROP_FPS)
    measurements = []
    previous_eyes = None
    while True:
        ok, frame = capture.read()
        if not ok:
            break
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        mask = cv2.inRange(hsv, (85, 70, 40), (130, 255, 255))
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contour = max(contours, key=cv2.contourArea)
        moments = cv2.moments(contour)
        center = np.array([moments["m10"], moments["m01"]]) / moments["m00"]
        inside = np.zeros_like(mask)
        cv2.drawContours(inside, [contour], -1, 255, -1)
        inside = cv2.erode(inside, np.ones((3, 3), np.uint8))
        white = cv2.bitwise_and(cv2.inRange(hsv, (0, 0, 145), (179, 75, 255)), inside)
        eyes, _ = cv2.findContours(white, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        eyes = sorted(eyes, key=cv2.contourArea, reverse=True)[:2]
        eyes = sorted(eyes, key=lambda eye: cv2.boundingRect(eye)[0])
        if len(eyes) != 2:
            if previous_eyes is None:
                raise ValueError("The first frame must show both eyes")
            eyes = previous_eyes
        previous_eyes = eyes
        centers = []
        for eye in eyes:
            m = cv2.moments(eye)
            x, y, width, height = cv2.boundingRect(eye)
            centers.append(np.array([m["m10"] / m["m00"], m["m01"] / m["m00"]])
                           if m["m00"] else np.array([x + width / 2, y + height / 2]))
        delta = centers[1] - centers[0]
        roll = math.atan2(delta[1], delta[0])
        rotation = np.array([[math.cos(roll), math.sin(roll)],
                             [-math.sin(roll), math.cos(roll)]])
        points = (contour[:, 0, :] - center) @ rotation.T
        body_size = np.ptp(points, axis=0)
        gaze = rotation @ ((centers[0] + centers[1]) / 2 - center)
        eye_sizes = [np.ptp((eye[:, 0, :] - centers[i]) @ rotation.T, axis=0) + 1
                     for i, eye in enumerate(eyes)]
        measurements.append([*center, -roll, *gaze, *eye_sizes[0], *eye_sizes[1], *body_size])
    capture.release()
    values = np.array(measurements)
    # A three-frame filter suppresses low-resolution segmentation jitter only.
    values = (np.vstack([values[:1], values[:-1]]) + values +
              np.vstack([values[1:], values[-1:]])) / 3
    origin = np.mean(values[:, :2], axis=0)
    size = np.median(values[:, 9:11], axis=0)
    gaze_origin = np.median(values[:, 3:5], axis=0)
    eye_size = np.median(values[:, 5:9], axis=0)
    samples = []
    for row in values:
        displacement = (row[:2] - origin) * 3 / size[0]
        gaze = (row[3:5] - gaze_origin) * 3 / size[0]
        samples.append([float(displacement[0]), float(-displacement[1]), float(row[2]),
                        float(gaze[0]), float(-gaze[1]),
                        *[float(x) for x in np.clip(row[5:9] / eye_size, .08, 1.8)],
                        *[float(x) for x in np.clip(row[9:11] / size, .85, 1.15)]])
    track = {"fps": fps, "duration": len(samples) / fps,
             "fields": ["x", "y", "lean", "lookX", "lookY", "leftWidth", "leftHeight",
                        "rightWidth", "rightHeight", "stretchX", "stretchY"],
             "samples": [[round(x, 5) for x in row] for row in samples]}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(track, separators=(",", ":")), encoding="utf-8")
    print(json.dumps({"frames": len(samples), "duration": track["duration"],
                      "ranges": {key: [round(float(values.min()), 4), round(float(values.max()), 4)]
                                 for key, values in zip(track["fields"], np.array(samples).T)}}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("video", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    extract(args.video, args.output)
