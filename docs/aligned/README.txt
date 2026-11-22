ALIGNED WALKTHROUGH VIDEOS
Built 22 November 2026 with FFmpeg (not DaVinci Resolve). Both files open in Resolve for polishing.

FILES
- User-Walkthrough-Aligned.mp4   4:30   narration: "Black Ad User.wav"
- Staff-Walkthrough-Aligned.mp4  3:37   narration: "SSC-Staff-Jemal.wav"
Same size as the originals (880 x 1912), 30 fps, h264 + AAC. The original recorded audio and the old caption track were removed. The only sound is the new narration. The narration is untouched.

HOW IT WAS ALIGNED
1. Each narration was split into paragraphs from its script. The start/end of each paragraph was located by matching sentence lengths to the pauses in the audio (no speech recognition was available), so timing is accurate to roughly one second.
2. For each paragraph, the matching scenes of the screen recording were chosen by looking at the footage frame by frame (the old captions were not reliable for timing).
3. Each scene group was sped up or slowed down (never beyond 0.7x - 1.75x) to end when its paragraph ends. If the footage was too short, the last frame is held still.
4. Scenes were reordered where the new script talks about them in a different order (e.g. user: tracking shown before profile/rewards; staff: Reset-to-defaults shown with Settings, Sales passcode shown first).

PARAGRAPH -> FOOTAGE (seconds in the ORIGINAL recordings) and speed
USER
 P1 welcome            0-5        0.70x +hold      P7 cart            141-153        0.70x +hold
 P2 six sections       4-12       0.70x +hold      P8 checkout        153-202        1.34x
 P3 products/bag/events 12-66     1.23x            P9 tracking/ready  204-216, 277-289  0.85x
 P4 head to the cafe   66-72      1.12x            P10 profile/favorites/order again/rewards 224-232, 244-250, 268-277, 250-256  1.23x
 P5 cafe + search      72-102     0.86x            P11 close          5-12 (back on the store home)  0.70x +hold
 P6 dish + extras      102-141    1.05x
STAFF
 P1 intro              0-1.8      held             P5 menu manager    56-64, 64-84, 84-98, 114-124, 130-136, 106-112   1.75x
 P2 access/connection  137-158    0.99x            P6 settings        158-188, 220-229   0.89x
 P3 orders overview    0-1.8, 20-33  0.70x +hold   P7 sales           215.5-219.5, 188-215.5   1.02x
 P4 prepare/ready/hand over  1.8-13, 36-55  0.76x  P8 close           229-235   0.70x +hold

THINGS TO KNOW BEFORE PUBLISHING
- The screen recordings come from an earlier test build: blue accent color, "Closed right now", and the staff video's local demo mode. They do not show the current orange look.
- The staff recording has no PIN screen and no database-connection card, so the narration about signing in plays over the Settings screen.
- Test phone numbers (for example 2025550142 and the 555 numbers on demo orders) are visible on the Orders screen.
- Several stretches are still or slowed (user 0:12-0:27 static sections grid, staff intro). If you want these shorter, trim or add footage.
