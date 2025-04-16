const clickableAreas = [
  {
    "rooms": [
      {
        "id": "dance_club",
        "type": "room",
        "label": "Dance Club",
        "description": "Dance Club description lorem ipsum dolor sit amet",
        "rect": { "x": 32, "y": 173, "width": 113, "height": 103 },
        "interactiveType": "click",
        "children": [
          { "id": "dance_chair_1", "type": "chair", "rect": { "x": 70.5, "y": 244, "width": 7, "height": 6 }, "interactiveType": "click" },
          { "id": "dance_chair_2", "type": "chair", "rect": { "x": 78, "y": 246, "width": 6, "height": 6 }, "interactiveType": "click" },
          { "id": "dance_chair_3", "type": "chair", "rect": { "x": 85, "y": 247, "width": 6, "height": 5 }, "interactiveType": "click" },
          { "id": "dance_chair_4", "type": "chair", "rect": { "x": 92.5, "y": 247.5, "width": 5, "height": 5 }, "interactiveType": "click" },
          { "id": "dance_chair_5", "type": "chair", "rect": { "x": 100, "y": 246, "width": 6, "height": 5 }, "interactiveType": "click" },
          { "id": "dance_chair_6", "type": "chair", "rect": { "x": 107, "y": 245.5, "width": 6, "height": 5 }, "interactiveType": "click" },
          { "id": "dance_chair_7", "type": "chair", "rect": { "x": 114, "y": 242.5, "width": 6, "height": 7 }, "interactiveType": "click" },
          { "id": "dance_chair_8", "type": "chair", "rect": { "x": 62.5, "y": 251, "width": 7, "height": 8 }, "interactiveType": "click" },
          { "id": "dance_chair_9", "type": "chair", "rect": { "x": 69, "y": 252, "width": 6, "height": 6 }, "interactiveType": "click" },
          { "id": "dance_chair_10", "type": "chair", "rect": { "x": 76, "y": 253, "width": 7, "height": 6 }, "interactiveType": "click" },
          { "id": "dance_chair_11", "type": "chair", "rect": { "x": 84, "y": 254, "width": 7, "height": 6 }, "interactiveType": "click" },
          { "id": "dance_chair_12", "type": "chair", "rect": { "x": 92, "y": 254, "width": 7, "height": 5 }, "interactiveType": "click" },
          { "id": "dance_chair_13", "type": "chair", "rect": { "x": 100, "y": 253, "width": 6, "height": 5 }, "interactiveType": "click" },
          { "id": "dance_chair_14", "type": "chair", "rect": { "x": 108, "y": 253, "width": 6, "height": 5 }, "interactiveType": "click" },
          { "id": "dance_chair_15", "type": "chair", "rect": { "x": 116, "y": 252, "width": 6, "height": 6 }, "interactiveType": "click" },
          { "id": "dance_stage", "type": "stage", "rect": { "x": 70, "y": 216, "width": 37, "height": 16 }, "interactiveType": "both" },
          { "id": "dance_banner_right", "type": "banner", "rect": { "x": 112, "y": 192, "width": 16, "height": 28 }, "interactiveType": "both" },
          { "id": "dance_banner_left", "type": "banner", "rect": { "x": 46, "y": 192, "width": 21, "height": 29 }, "interactiveType": "both" },
          { "id": "dance_banner_bg", "type": "banner", "rect": { "x": 69, "y": 192, "width": 40, "height": 25 }, "interactiveType": "both" }
        ]
      },
      {
        "id": "cultural_club",
        "type": "room",
        "label": "Cultural Club",
        "description": "cultural Club description lorem ipsum dolor sit amet",
        "rect": { "x": 35, "y": 346, "width": 113, "height": 106 },
        "interactiveType": "click",
        "children": [
          { "id": "cultural_chair_1", "type": "chair", "rect": { "x": 50, "y": 384, "width": 25, "height": 25 }, "interactiveType": "click" },
          { "id": "cultural_chair_2", "type": "chair", "rect": { "x": 80, "y": 382, "width": 24, "height": 28 }, "interactiveType": "click" },
          { "id": "cultural_chair_3", "type": "chair", "rect": { "x": 112, "y": 383, "width": 24, "height": 27 }, "interactiveType": "click" },
          { "id": "cultural_chair_4", "type": "chair", "rect": { "x": 50, "y": 420, "width": 21, "height": 24 }, "interactiveType": "click" },
          { "id": "cultural_chair_5", "type": "chair", "rect": { "x": 79, "y": 422, "width": 24, "height": 22 }, "interactiveType": "click" },
          { "id": "cultural_chair_6", "type": "chair", "rect": { "x": 114, "y": 422, "width": 22, "height": 23 }, "interactiveType": "click" },
          { "id": "cultural_banner", "type": "banner", "rect": { "x": 68, "y": 346, "width": 49, "height": 37 }, "interactiveType": "both" }
        ]
      },
      {
        "id": "sports_club",
        "type": "room",
        "label": "Sports Club",
        "description": "sports Club description lorem ipsum dolor sit amet",
        "rect": { "x": 33, "y": 516, "width": 110, "height": 98 },
        "interactiveType": "click",
        "children": [
          { "id": "sports_chair_1", "type": "chair", "rect": { "x": 57, "y": 567, "width": 14, "height": 21 }, "interactiveType": "click" },
          { "id": "sports_chair_2", "type": "chair", "rect": { "x": 71, "y": 567, "width": 14, "height": 21 }, "interactiveType": "click" },
          { "id": "sports_chair_3", "type": "chair", "rect": { "x": 85, "y": 567, "width": 14, "height": 21 }, "interactiveType": "click" },
          { "id": "sports_chair_4", "type": "chair", "rect": { "x": 99, "y": 567, "width": 14, "height": 21 }, "interactiveType": "click" },
          { "id": "sports_chair_5", "type": "chair", "rect": { "x": 113, "y": 567, "width": 14, "height": 21 }, "interactiveType": "click" },
          { "id": "sports_chair_6", "type": "chair", "rect": { "x": 57, "y": 591, "width": 14, "height": 21 }, "interactiveType": "click" },
          { "id": "sports_chair_7", "type": "chair", "rect": { "x": 71, "y": 591, "width": 14, "height": 21 }, "interactiveType": "click" },
          { "id": "sports_chair_8", "type": "chair", "rect": { "x": 85, "y": 591, "width": 14, "height": 21 }, "interactiveType": "click" },
          { "id": "sports_chair_9", "type": "chair", "rect": { "x": 99, "y": 591, "width": 14, "height": 21 }, "interactiveType": "click" },
          { "id": "sports_chair_10", "type": "chair", "rect": { "x": 113, "y": 591, "width": 14, "height": 21 }, "interactiveType": "click" },
          { "id": "sports_banner", "type": "banner", "rect": { "x": 66, "y": 521, "width": 52, "height": 35 }, "interactiveType": "both" }
        ]
      },
      {
        "id": "music_club",
        "type": "room",
        "label": "Music Club",
        "rect": { "x": 201, "y": 317, "width": 94, "height": 90 },
        "interactiveType": "click",
        "children": [
          { "id": "music_stage", "type": "stage", "rect": { "x": 239, "y": 364, "width": 19, "height": 18 }, "interactiveType": "both" },
          { "id": "music_banner", "type": "banner", "rect": { "x": 201, "y": 317, "width": 94, "height": 46 }, "interactiveType": "both" }
        ]
      },
      {
        "id": "dsa_club",
        "type": "room",
        "label": "DSA Club",
        "rect": { "x": 202, "y": 507, "width": 94, "height": 88 },
        "interactiveType": "click",
        "children": [
          { "id": "dsa_chair_1", "type": "chair", "rect": { "x": 227, "y": 552, "width": 14, "height": 19 }, "interactiveType": "click" },
          { "id": "dsa_chair_2", "type": "chair", "rect": { "x": 252, "y": 552, "width": 14, "height": 19 }, "interactiveType": "click" },
          { "id": "dsa_chair_3", "type": "chair", "rect": { "x": 275, "y": 552, "width": 14, "height": 19 }, "interactiveType": "click" },
          { "id": "dsa_chair_4", "type": "chair", "rect": { "x": 215, "y": 572, "width": 14, "height": 19 }, "interactiveType": "click" },
          { "id": "dsa_chair_5", "type": "chair", "rect": { "x": 239, "y": 572, "width": 14, "height": 19 }, "interactiveType": "click" },
          { "id": "dsa_chair_6", "type": "chair", "rect": { "x": 263, "y": 572, "width": 14, "height": 19 }, "interactiveType": "click" },
          { "id": "dsa_stage", "type": "stage", "rect": { "x": 250, "y": 526, "width": 33, "height": 25 }, "interactiveType": "both" },
          { "id": "dsa_screen", "type": "screen", "rect": { "x": 204, "y": 519, "width": 17, "height": 48 }, "interactiveType": "both" }
        ]
      },
      {
        "id": "study_room_1",
        "type": "room",
        "label": "Study Room 1",
        "description": "Dance Club description lorem ipsum dolor sit amet",
        "rect": { "x": 107, "y": 779, "width": 104, "height": 103 },
        "interactiveType": "both",
        "children": [
          { "id": "study1_chair_1", "type": "chair", "rect": { "x": 162, "y": 852, "width": 18, "height": 20 }, "interactiveType": "click" },
          { "id": "study1_books", "type": "books", "rect": { "x": 112, "y": 786, "width": 86, "height": 27 }, "interactiveType": "both" }
        ]
      },
      {
        "id": "study_room_2",
        "type": "room",
        "label": "Study Room 2",
        "rect": { "x": 241, "y": 785, "width": 92, "height": 91 },
        "interactiveType": "both",
        "children": [
          { "id": "study2_chair_1", "type": "chair", "rect": { "x": 300, "y": 824, "width": 16, "height": 25 }, "interactiveType": "click" },
          { "id": "study2_books", "type": "books", "rect": { "x": 243, "y": 786, "width": 89, "height": 28 }, "interactiveType": "both" }
        ]
      },
      {
        "id": "study_room_3",
        "type": "room",
        "label": "Study Room 3",
        "rect": { "x": 376, "y": 786, "width": 101, "height": 92 },
        "interactiveType": "both",
        "children": [
          { "id": "study3_chair_1", "type": "chair", "rect": { "x": 400, "y": 820, "width": 16, "height": 24 }, "interactiveType": "click" },
          { "id": "study3_chair_2", "type": "chair", "rect": { "x": 440, "y": 820, "width": 16, "height": 23 }, "interactiveType": "click" },
          { "id": "study3_chair_3", "type": "chair", "rect": { "x": 400, "y": 850, "width": 17, "height": 24 }, "interactiveType": "click" },
          { "id": "study3_chair_4", "type": "chair", "rect": { "x": 440, "y": 850, "width": 18, "height": 21 }, "interactiveType": "click" },
          { "id": "study3_books", "type": "books", "rect": { "x": 377, "y": 784, "width": 100, "height": 30 }, "interactiveType": "both" }
        ]
      },
      {
        "id": "study_room_4",
        "type": "room",
        "label": "Study Room 4",
        "rect": { "x": 506, "y": 787, "width": 101, "height": 90 },
        "interactiveType": "both",
        "children": [
          { "id": "study4_chair_1", "type": "chair", "rect": { "x": 525, "y": 823, "width": 19, "height": 22 }, "interactiveType": "click" },
          { "id": "study4_chair_2", "type": "chair", "rect": { "x": 571, "y": 826, "width": 17, "height": 20 }, "interactiveType": "click" },
          { "id": "study4_chair_3", "type": "chair", "rect": { "x": 528, "y": 853, "width": 16, "height": 21 }, "interactiveType": "click" },
          { "id": "study4_chair_4", "type": "chair", "rect": { "x": 571, "y": 852, "width": 16, "height": 21 }, "interactiveType": "click" },
          { "id": "study4_books", "type": "books", "rect": { "x": 507, "y": 786, "width": 100, "height": 31 }, "interactiveType": "both" }
        ]
      },
      {
        "id": "mentor_room_1",
        "type": "room",
        "label": "Mentor Room 1",
        "rect": { "x": 670, "y": 779, "width": 110, "height": 90 },
        "interactiveType": "both",
        "children": [
          { "id": "mentor1_board", "type": "board", "rect": { "x": 674, "y": 782, "width": 104, "height": 27 }, "interactiveType": "both" },
          { "id": "mentor1_waiting", "type": "waiting_area", "rect": { "x": 679, "y": 806, "width": 98, "height": 64 }, "interactiveType": "both" }
        ]
      },
      {
        "id": "mentor_room_2",
        "type": "room",
        "label": "Mentor Room 2",
        "rect": { "x": 801, "y": 780, "width": 110, "height": 90 },
        "interactiveType": "both",
        "children": [
          { "id": "mentor2_board", "type": "board", "rect": { "x": 800, "y": 780, "width": 110, "height": 28 }, "interactiveType": "both" },
          { "id": "mentor2_waiting", "type": "waiting_area", "rect": { "x": 803, "y": 806, "width": 109, "height": 64 }, "interactiveType": "both" }
        ]
      },
      {
        "id": "gaming_arena",
        "type": "room",
        "label": "Gaming Arena",
        "rect": { "x": 713, "y": 335, "width": 116, "height": 81 },
        "interactiveType": "both"
      },
      {
        "id": "cafeteria",
        "type": "room",
        "label": "Cafeteria",
        "rect": { "x": 706, "y": 518, "width": 132, "height": 107 },
        "interactiveType": "both"
      },
      {
        "id": "stage",
        "type": "room",
        "label": "stage",
        "rect": { "x": 357, "y": 203, "width": 310, "height": 156 },
        "interactiveType": "both"
      },
      {
        "id": "lab",
        "type": "room",
        "label": "Lab",
        "rect": { "x": 877, "y": 179, "width": 109, "height": 92 },
        "interactiveType": "both"
      },
      {
        "id": "class_1",
        "type": "room",
        "label": "Class 1",
        "rect": { "x": 878, "y": 322, "width": 110, "height": 100 },
        "interactiveType": "both",
        "children": [
          { "id": "class1_board", "type": "board", "rect": { "x": 876, "y": 321, "width": 110, "height": 28 }, "interactiveType": "both" }
        ]
      },
      {
        "id": "class_2",
        "type": "room",
        "label": "Class 2",
        "rect": { "x": 879, "y": 496, "width": 108, "height": 100 },
        "interactiveType": "both",
        "children": [
          { "id": "class2_board", "type": "board", "rect": { "x": 879, "y": 496, "width": 110, "height": 32 }, "interactiveType": "both" }
        ]
      }
    ]
  }
  ];
  
  export default clickableAreas;