import { useState, useRef, useEffect } from "react";

const COLORS = {
  bg: "#07070D", panel: "#0F0F1C", card: "#111120",
  border: "#1A1A32", blue: "#4FC3F7", amber: "#FFB347",
  green: "#5BE06A", purple: "#B48EF7", white: "#F0F0F8",
  muted: "#5A5A7A", lgrey: "#8080A8",
};

const CH_COLOR = { "01":"#4FC3F7","02":"#4FC3F7","03":"#B48EF7","04":"#FFB347","05":"#FFB347","06":"#5BE06A" };

const PROMPTS = [
  { id:"001", ch:"01", cat:"Pre-Production & Vision",
    name:"The Brief Decoder",
    desc:"Decode a vague client brief into three concrete visual directions with film references, lighting styles, and one red flag.",
    prompt:"You are a senior creative director and cinematographer with 15 years of high-end commercial production experience. You have directed and shot campaigns for luxury, wellness, automotive, and non-profit brands.\n\nA client has given me the following brief:\n[CLIENT_BRIEF]\n\nProduction budget: [BUDGET]\nDeliverable format: [FORMAT]\nShoot timeline: [TIMELINE]\n\nDecode this brief completely. Return the following sections:\n\nSECTION 01 — CORE MESSAGE\nThe single emotional truth this film must communicate. One sentence. Ruthlessly specific — not generic words like authentic or inspiring, but the precise human feeling at the centre of this film.\n\nSECTION 02 — THREE VISUAL DIRECTIONS\nFor each direction:\n- Film reference: specific DP and film title, not just the director\n- Lighting philosophy: colour temperature, quality, shadow ratio\n- Camera movement: locked, handheld, dolly — and the emotional reason for each choice\n- Dominant focal length and what it communicates\n- One-sentence emotional tone for the entire piece\n\nSECTION 03 — FIVE PRE-PRODUCTION QUESTIONS\nQuestions I must have answered before a single frame is designed. Ranked by importance.\n\nSECTION 04 — TWO RED FLAGS\nSpecific scope creep risks buried in this brief and how to address each before signing.\n\nSECTION 05 — RECOMMENDED DIRECTION\nWhich of the three you recommend and the precise reason why.\n\nWrite with the authority of someone who has been burned by a vague brief and made it work anyway.",
    vars:[{k:"CLIENT_BRIEF",l:"Client Brief",ph:'"We want something that feels authentic and modern for our wellness brand launch."'},{k:"BUDGET",l:"Production Budget",ph:"$15,000 all-in including post-production"},{k:"FORMAT",l:"Deliverable Format",ph:"60-second hero brand film plus three 15-second social cuts"},{k:"TIMELINE",l:"Shoot Timeline",ph:"4 weeks from brief to delivery — shoot in week 2"}]
  },
  { id:"002", ch:"01", cat:"Pre-Production & Vision",
    name:"The Shot List Generator",
    desc:"Generate a complete, professional shot list with shot types, focal lengths, camera movements, lighting notes, and emotional function.",
    prompt:"You are a professional cinematographer and 1st AD building a production-ready shot list. Every shot on this list must be achievable on the day, serve the narrative, and be executable by any competent crew.\n\nProject type: [PROJECT_TYPE]\nCreative direction: [CREATIVE_DIRECTION]\nPrimary location: [LOCATION]\nPrimary subject: [SUBJECT]\nTotal shots required: [SHOT_COUNT]\nShoot day duration: [SHOOT_DAY]\n\nBuild a complete shot list. For every shot include:\n\nSHOT [NUMBER]\nDescription: What is in the frame, where the camera is, what the subject is doing\nShot Type: ECU, CU, MCU, MS, WS, OTS, POV, INSERT, or 2-SHOT\nLens: Focal length and T-stop if critical to the look\nMovement: Specific movement, speed, and what motivates it in the scene\nLighting Reference: One specific film scene this shot echoes\nSound Notes: Dialogue, atmos, wild track, or silent\nDuration in Edit: How long this shot lives in the final cut\nEmotional Function: The single emotional job this shot performs. If it cannot be stated in one sentence, the shot is not yet conceived.\n\nClose with:\nPRIORITY ORDER — ranked from most critical to coverage shots\nCONTINGENCY — two shots that can be cut without losing the story\nHERO SHOT — the single most important frame of the day and why",
    vars:[{k:"PROJECT_TYPE",l:"Project Type",ph:"90-second luxury skincare brand film"},{k:"CREATIVE_DIRECTION",l:"Creative Direction",ph:"Intimate golden hour aesthetic referencing Terrence Malick — natural light only"},{k:"LOCATION",l:"Shoot Location",ph:"Modern minimalist apartment, floor-to-ceiling windows facing west"},{k:"SUBJECT",l:"Primary Subject",ph:"Female founder, late 30s, confident and unhurried"},{k:"SHOT_COUNT",l:"Number of Shots",ph:"12 shots"},{k:"SHOOT_DAY",l:"Shoot Day Duration",ph:"10-hour day, 1 location"}]
  },
  { id:"003", ch:"01", cat:"Pre-Production & Vision",
    name:"The Visual Bible Builder",
    desc:"Build a complete visual bible — lighting philosophy, camera language, colour world, and emotional thesis — to align every department.",
    prompt:"You are a DP creating a visual bible for a production called [PROJECT_NAME]\n\nClient: [CLIENT_NAME]\nEmotional tone: [TONE]\nOne-sentence story: [STORY]\n\nCreate a visual bible with five sections:\n\n1. VISUAL THESIS — one paragraph, two film references and why they apply.\n2. LIGHTING PHILOSOPHY — key light quality, colour temperature, shadow ratio, and one specific setup that defines the look.\n3. CAMERA LANGUAGE — movement philosophy, dominant focal lengths, and what handheld vs. locked-off communicates in this project.\n4. COLOUR WORLD — palette, grade style reference, and what colour is used for emotional punctuation.\n5. WHAT THIS FILM FEELS LIKE — three sentences. The viewer's experience, not the technical execution.\n\nThis document will be shared with the client and every department head.",
    vars:[{k:"PROJECT_NAME",l:"Project Name",ph:"GOLDEN — A Brand Film for Aura Wellness"},{k:"CLIENT_NAME",l:"Client",ph:"Aura Wellness Co."},{k:"TONE",l:"Emotional Tone",ph:"Intimate, unhurried, quietly aspirational"},{k:"STORY",l:"Story in One Sentence",ph:"A woman who has chosen herself first, and what that looks like at 6am."}]
  },
  { id:"004", ch:"01", cat:"Pre-Production & Vision",
    name:"The Emotional Shot List",
    desc:"Build a shot list where every frame is justified by emotional function — for brand films, documentaries, and narrative work.",
    prompt:"You are a cinematographer working on an emotionally driven [PROJECT_TYPE]\n\nCore emotion this project must leave the viewer feeling: [CORE_EMOTION]\n\nSubject: [SUBJECT]\n\nBuild a shot list where every shot serves one specific emotional function.\nFor each shot include:\nShot Number / Shot Type / Camera Movement / The Specific Emotion This Shot Creates / How the framing achieves that technically / What emotional gap is left if this shot is cut\n\nDo not include any shot that cannot be emotionally justified.\nThe final shot must be the most emotionally resonant image of the film.\nExplain why you chose it as the close.",
    vars:[{k:"PROJECT_TYPE",l:"Project Type",ph:"5-minute documentary short about a retiring craftsman"},{k:"CORE_EMOTION",l:"Core Emotion",ph:"The particular grief of watching mastery disappear from the world"},{k:"SUBJECT",l:"Subject",ph:"72-year-old watchmaker, 50 years in the same workshop"}]
  },
  { id:"005", ch:"01", cat:"Pre-Production & Vision",
    name:"The Mood Board Brief",
    desc:"Translate your creative vision into precise visual language for AI image tools, designers, and producers.",
    prompt:"You are a creative director preparing a mood board brief for a [PROJECT_TYPE]\n\nVisual direction: [VISUAL_DIRECTION]\n\nProduction environment: [LOCATION]\n\nTime of day: [TIME]\n\nCreate a mood board brief including:\n1. Five specific image descriptions — each 2-3 sentences, detailed enough to generate or find. Include: lighting quality, colour temperature, subject position, depth of field.\n2. Three colour palette references — described by emotional function, not by name.\n3. Two specific film stills that capture the visual world and why.\n4. One visual element that must NEVER appear and why it would kill the tone.\n\nFormat for a designer who has never read the project brief.",
    vars:[{k:"PROJECT_TYPE",l:"Project Type",ph:"60-second automotive brand film for a luxury EV launch"},{k:"VISUAL_DIRECTION",l:"Visual Direction",ph:"Dark, wet urban environments. Neon reflections. The car as protagonist, not prop."},{k:"LOCATION",l:"Environment",ph:"Night exteriors, downtown Atlanta, rain-slicked streets"},{k:"TIME",l:"Time of Day",ph:"Night — 2am blue hour and beyond"}]
  },
  { id:"006", ch:"02", cat:"Cinematography & Visual Language",
    name:"The Lighting Setup Designer",
    desc:"Design a complete, shootable lighting setup — key, fill, background, practicals, and a film reference — that any gaffer can execute.",
    prompt:"You are a professional gaffer and director of photography with credits on major commercial and documentary productions. You approach every lighting setup as a creative decision, not a technical one.\n\nScene to light: [SCENE_DESCRIPTION]\nEmotional tone required: [TONE]\nFilm reference direction: [FILM_REFERENCE]\nAvailable equipment: [EQUIPMENT]\nLocation constraints: [CONSTRAINTS]\n\nDesign a complete, shootable lighting setup:\n\nKEY LIGHT\nPosition relative to camera, height, distance from subject, modifier, colour temperature, quality, ratio, and the emotional reason for every decision.\n\nFILL OR NEGATIVE FILL\nApproach, ratio, and what the shadow reveals about the subject that flat light would destroy.\n\nBACKGROUND TREATMENT\nLit or unlit, separated or merged, and what the background communicates about the subject's world.\n\nPRACTICAL SOURCES\nEvery in-frame light source, its actual vs. perceived output, and how to enhance it toward the look.\n\nFILM REFERENCE BREAKDOWN\nThe specific scene from your reference that defines this setup and what the gaffer technically did to achieve it.\n\nWHAT CHANGES IF:\n- Subject moves 2 feet toward the window\n- You lose your key light 30 minutes before wrap\n- The client asks for a warmer, more commercial look",
    vars:[{k:"SCENE_DESCRIPTION",l:"Scene Description",ph:"Interior interview. Female CEO, 45. Feeling: authoritative but warm. Modern corner office, two floor-to-ceiling windows facing north."},{k:"TONE",l:"Emotional Tone",ph:"Quietly powerful. Think Vilmos Zsigmond — available-feeling light that is precisely controlled."},{k:"EQUIPMENT",l:"Available Equipment",ph:"Two ARRI SkyPanel S60s, two 4x4 bounce frames, one negative fill flag, one practical desk lamp"},{k:"FILM_REFERENCE",l:"Film Reference",ph:"Janusz Kaminski — Lincoln (2012), cabinet scenes"},{k:"CONSTRAINTS",l:"Location Constraints",ph:"Cannot black out windows. No rigging to ceiling. Two-hour setup time."}]
  },
  { id:"007", ch:"02", cat:"Cinematography & Visual Language",
    name:"The Camera Movement Sequence",
    desc:"Design a fully motivated camera movement sequence where every move serves the scene — no arbitrary stylistic choices.",
    prompt:"You are a DP designing a camera movement sequence for this scene:\n\n[SCENE_DESCRIPTION]\n\nAvailable camera support: [EQUIPMENT]\n\nSequence duration: [DURATION]\n\nFor each move:\n— Starting frame and ending frame\n— Type of movement and speed\n— What motivates the move in the scene (always motivated — never stylistic)\n— What the viewer feels during and after the move\n\nInclude at least one completely static shot and explain its function.\nNote: if a move cannot be motivated by something in the scene, it does not belong here.",
    vars:[{k:"SCENE_DESCRIPTION",l:"Scene Description",ph:"A man receives a phone call that ends his marriage. He is in his kitchen. He hangs up and does not move for 30 seconds."},{k:"EQUIPMENT",l:"Camera Support",ph:"Steadicam, 40ft dolly track, locked-off tripod, handheld"},{k:"DURATION",l:"Sequence Duration",ph:"90 seconds"}]
  },
  { id:"008", ch:"02", cat:"Cinematography & Visual Language",
    name:"The Lens Language Advisor",
    desc:"Match focal length and lens character to the emotional requirements of your project — lens choice as a storytelling decision.",
    prompt:"You are a cinematographer choosing a lens package for a [PROJECT_TYPE]\n\nVisual direction: [VISUAL_DIRECTION]\n\nCamera system: [CAMERA_BODY]\n\nAvailable lenses: [LENS_OPTIONS]\n\nRecommend a complete lens package:\n1. Primary lens for hero shots — focal length, character, and emotional reasoning.\n2. Wide lens — when to use it and what it communicates in this project.\n3. Intimate lens — for the closest emotional moments.\n4. One specialty choice (anamorphic / vintage / diopter) that elevates this project.\n5. The focal length to AVOID and the exact reason why.\n\nReference real films that made similar choices.",
    vars:[{k:"PROJECT_TYPE",l:"Project Type",ph:"Feature documentary about a family navigating immigration"},{k:"VISUAL_DIRECTION",l:"Visual Direction",ph:"Intimate, present-tense, slightly uncomfortable proximity. We are in the family's world, not observing it."},{k:"CAMERA_BODY",l:"Camera Body",ph:"ARRI Alexa Mini LF"},{k:"LENS_OPTIONS",l:"Available Lenses",ph:"Full access: Zeiss Supremes, Cooke S7s, Leica Summilux-Cs, or vintage Cooke Speed Panchros"}]
  },
  { id:"009", ch:"02", cat:"Cinematography & Visual Language",
    name:"The Colour Palette Generator",
    desc:"Define the complete colour world of a project — dominant, accent, shadow, suppressed colours, and grade reference — precise enough for every department.",
    prompt:"You are a colorist and DP defining the colour world for a [PROJECT_TYPE]\n\nEmotional tone: [TONE]\n\nSetting/environment: [SETTING]\n\nClient/brand: [CLIENT]\n\nDefine the complete colour palette:\n1. Dominant colour — what it is, its emotional function, where it lives in frame.\n2. Accent colour — for emotional punctuation, where it appears and what it signals.\n3. Shadow colour — what lives in the darkness and why.\n4. Colours intentionally suppressed and why.\n5. Grade reference — specific film, technical approach (lift/gamma/gain, skin tone, highlight rolloff).\n6. One-sentence colour thesis for the project.",
    vars:[{k:"PROJECT_TYPE",l:"Project Type",ph:"Brand documentary series for a sustainable architecture firm"},{k:"TONE",l:"Emotional Tone",ph:"Considered, slow-burning, quietly radical. The opposite of urgency."},{k:"SETTING",l:"Setting / Environment",ph:"Raw concrete interiors, forest exteriors, Pacific Northwest light"},{k:"CLIENT",l:"Client / Brand",ph:"A firm that believes buildings should age honestly, like people"}]
  },
  { id:"010", ch:"02", cat:"Cinematography & Visual Language",
    name:"The Film Reference Matcher",
    desc:"Translate a vague film reference into precise, shootable technical direction — lighting signatures, movement philosophy, and what can't be replicated on your budget.",
    prompt:"A client or director has referenced [FILM_OR_DIRECTOR] as visual inspiration.\n\nProject type: [PROJECT_TYPE]\n\nBudget level: [BUDGET_LEVEL]\n\nBreak this reference down into actionable technical direction:\n1. What specifically they probably love — the 2-3 visual signatures defining this filmmaker's work.\n2. How to achieve that look with our specific equipment and budget.\n3. Lighting signatures — described technically for a gaffer.\n4. Camera movement philosophy — how this filmmaker uses the camera and why.\n5. Editing rhythm this visual style implies.\n6. What is impossible to replicate without the original budget — and what to do instead.",
    vars:[{k:"FILM_OR_DIRECTOR",l:"Film or Director Reference",ph:"Early David Fincher"},{k:"PROJECT_TYPE",l:"Project Type",ph:"Brand film for a cybersecurity company"},{k:"BUDGET_LEVEL",l:"Budget Level",ph:"Mid-range — $25,000 production budget"}]
  },
  { id:"011", ch:"03", cat:"AI Video Tool Prompts",
    name:"The Runway Cinematic Formula",
    desc:"Generate Runway Gen-3 prompts that produce professional cinematography standards — not generic AI video aesthetics.",
    prompt:"Generate a [DURATION]-second cinematic video clip.\n\nSubject: [SUBJECT]\n\nEnvironment: [ENVIRONMENT]\n\nCamera: [SHOT_TYPE] on [FOCAL_LENGTH]mm equivalent\n\nMovement: [MOVEMENT]\n\nLighting: [LIGHTING]\n\nFilm reference: Cinematography of [DP_FILM_REFERENCE]\n\nGrain: [GRAIN_TEXTURE]\nMood (one word): [MOOD]\n\nDO NOT include: lens flares, over-saturation, drone aesthetics, stock footage movement, anything that looks like an advertisement.",
    vars:[{k:"DURATION",l:"Clip Duration (seconds)",ph:"6"},{k:"SUBJECT",l:"Subject Description",ph:"A woman in her mid-30s, dark hair pulled back, white linen shirt, standing at a kitchen window"},{k:"ENVIRONMENT",l:"Environment",ph:"Sunlit modern kitchen, warm wood tones, soft morning haze through large east-facing windows"},{k:"SHOT_TYPE",l:"Shot Type",ph:"Medium close-up"},{k:"FOCAL_LENGTH",l:"Focal Length (mm)",ph:"85"},{k:"MOVEMENT",l:"Camera Movement",ph:"Imperceptibly slow push in — we move toward her as she breathes out"},{k:"LIGHTING",l:"Lighting",ph:"Golden window backlight 5500K, warm bounce camera-right, deep shadow left — ratio 4:1"},{k:"DP_FILM_REFERENCE",l:"DP / Film Reference",ph:"Hoyte van Hoytema — Her (2013)"},{k:"GRAIN_TEXTURE",l:"Grain / Texture",ph:"Subtle 35mm grain, warm and organic"},{k:"MOOD",l:"Mood (one word)",ph:"Longing"}]
  },
  { id:"012", ch:"03", cat:"AI Video Tool Prompts",
    name:"The Sora Scene Builder",
    desc:"Build full narrative-context Sora prompts that reward storytelling structure — for wide establishing shots and world-building.",
    prompt:"Create a cinematic scene with complete narrative context.\n\nScene context: [SCENE_CONTEXT]\n\nVisual world reference: [FILM_REFERENCE]\n\nOpening frame: [OPENING_FRAME]\n\nCamera language: The camera [MOVEMENT] motivated by [MOTIVATION]\n\nEmotional arc: Begins [START_EMOTION], ends [END_EMOTION]\n\nFinal frame: [CLOSING_IMAGE]",
    vars:[{k:"SCENE_CONTEXT",l:"Scene Context",ph:"A scientist realises her 10-year experiment has just failed. She is alone in a lab at 3am."},{k:"FILM_REFERENCE",l:"Visual Reference",ph:"Denis Villeneuve's Arrival — Bradford Young's interior light as isolation, not atmosphere"},{k:"OPENING_FRAME",l:"Opening Frame",ph:"Wide shot of the lab. Scientist is a small figure at the far end. One monitor casting blue light."},{k:"MOVEMENT",l:"Camera Movement",ph:"does not move. It watches."},{k:"MOTIVATION",l:"What Motivates It",ph:"This is her moment, not ours."},{k:"START_EMOTION",l:"Starting Emotion",ph:"Controlled stillness — someone holding it together"},{k:"END_EMOTION",l:"Ending Emotion",ph:"The precise moment she stops holding it together"},{k:"CLOSING_IMAGE",l:"Final Frame",ph:"ECU on her hands on the desk. The work was always in her hands."}]
  },
  { id:"013", ch:"03", cat:"AI Video Tool Prompts",
    name:"The Hero Shot Generator",
    desc:"Generate a single defining image — the visual anchor of the entire production — for thumbnails, posters, and opening frames.",
    prompt:"Generate a single hero shot for a [PROJECT_TYPE]\n\nSubject: [SUBJECT]\n\nExpression communicates: [EMOTION]\n\nFraming: [SHOT_TYPE], subject [POSITION], [NEGATIVE_SPACE]\n\nLighting: key from [LIGHTING_DIRECTION], creating [SHADOW_PATTERN]\n\nBackground: [BACKGROUND] — [FOCUS_TREATMENT]\n\nThis frame must communicate: [EMOTIONAL_THESIS]",
    vars:[{k:"PROJECT_TYPE",l:"Project Type",ph:"Brand film for a luxury watchmaker celebrating 100 years of craft"},{k:"SUBJECT",l:"Subject",ph:"Male watchmaker, 70s, weathered hands, reading glasses pushed up on forehead"},{k:"EMOTION",l:"Emotion to Communicate",ph:"The quiet satisfaction of mastery that has never needed an audience"},{k:"SHOT_TYPE",l:"Shot Type",ph:"Medium close-up"},{k:"POSITION",l:"Subject Position",ph:"left-third"},{k:"NEGATIVE_SPACE",l:"Negative Space",ph:"right — workshop receding into soft darkness"},{k:"LIGHTING_DIRECTION",l:"Lighting Direction",ph:"single tungsten work lamp camera-right, no fill"},{k:"SHADOW_PATTERN",l:"Shadow Pattern",ph:"split lighting, ratio 8:1 minimum"},{k:"BACKGROUND",l:"Background",ph:"Workshop tools and benches"},{k:"FOCUS_TREATMENT",l:"Focus Treatment",ph:"completely out of focus, warm amber blur"},{k:"EMOTIONAL_THESIS",l:"Emotional Thesis",ph:"That some things are worth doing slowly, for their own sake, forever."}]
  },
  { id:"014", ch:"03", cat:"AI Video Tool Prompts",
    name:"The Transition Sequence Prompt",
    desc:"Design visually motivated AI transition sequences where every cut is connected by logic — colour, movement, texture, or emotion.",
    prompt:"Design a [SHOT_COUNT]-shot transition sequence for [PROJECT_TYPE] using [AI_TOOL]\n\nThe sequence moves from [START_STATE] to [END_STATE]\n\nFor each shot provide:\n1. Shot description — subject, environment, time, light\n2. Duration\n3. The visual element connecting to the NEXT shot\n4. The emotional shift in the transition\n5. Optimised prompt language for [AI_TOOL] to generate this specific shot\n\nRules:\n— Every transition motivated by visual or narrative logic\n— Emotional temperature rises (or falls) consistently\n— Reference the cutting style of [CUTTING_REFERENCE]",
    vars:[{k:"SHOT_COUNT",l:"Number of Shots",ph:"5"},{k:"PROJECT_TYPE",l:"Project Type",ph:"luxury hotel brand film"},{k:"AI_TOOL",l:"AI Video Tool",ph:"Runway Gen-3"},{k:"START_STATE",l:"Starting State",ph:"The stillness of 5am arrival"},{k:"END_STATE",l:"Ending State",ph:"The full warmth of a morning in motion"},{k:"CUTTING_REFERENCE",l:"Cutting Reference",ph:"Walter Murch — cut on emotion, not action"}]
  },
  { id:"015", ch:"03", cat:"AI Video Tool Prompts",
    name:"The BTS Content Generator",
    desc:"Turn every shoot into scroll-stopping social content — 5 ranked hooks with story angles, educational payoffs, and niche hashtags.",
    prompt:"I am a [YOUR_ROLE] and I just completed a [PROJECT_TYPE]\n\nInteresting technical details from this shoot:\n[TECHNICAL_DETAILS]\n\nThe most interesting problem I solved: [PROBLEM_AND_SOLUTION]\n\nGenerate 5 BTS content hooks for [PLATFORM]\nFor each hook:\n— Opening line (stops scroll — max 8 words, never starts with \"I\")\n— Core story angle\n— Educational payoff for aspiring filmmakers\n— Caption\n— 5 niche hashtags\n\nRank from most to least likely to perform. Explain the #1 ranking.",
    vars:[{k:"YOUR_ROLE",l:"Your Role",ph:"cinematographer"},{k:"PROJECT_TYPE",l:"Project Type",ph:"2-day brand film shoot for a luxury real estate developer in Atlanta"},{k:"TECHNICAL_DETAILS",l:"Technical Details (list 3-5)",ph:"1. Shot entire film using only practical sources. 2. Used a vintage 1970s Canon K-35 on an Alexa Mini. 3. Location lost power for 6 hours."},{k:"PROBLEM_AND_SOLUTION",l:"Most Interesting Problem Solved",ph:"Location lost power. We shot by candlelight — those shots became the best in the film."},{k:"PLATFORM",l:"Platform",ph:"TikTok"}]
  },
  { id:"016", ch:"04", cat:"Post-Production & Editorial",
    name:"The Edit Structure Planner",
    desc:"Plan the structural arc of your edit before opening your timeline — act structure, turning point, music placement, and the right closing image.",
    prompt:"You are a senior editor. I have completed a shoot for a [DURATION] final piece.\n\nProject type: [PROJECT_TYPE]\nFootage available: [FOOTAGE_DESCRIPTION]\nStory in one sentence: [STORY]\nCore emotion at end: [EMOTION]\n\nBuild an edit structure:\n1. Opening 10 seconds — what we see and hear, and why it earns attention.\n2. Act structure — how many acts, what each contains, how long each runs.\n3. The emotional turning point — where it is and what changes on either side.\n4. The role of music — where it enters, drops, swells, and where silence wins.\n5. The closing image — what it is and why it is the right ending.\n\nDo not give me a generic three-act structure. Give me one specific to this footage and this story.",
    vars:[{k:"DURATION",l:"Final Piece Duration",ph:"90-second brand film"},{k:"PROJECT_TYPE",l:"Project Type",ph:"Emotional brand documentary for a non-profit"},{k:"FOOTAGE_DESCRIPTION",l:"Footage Available",ph:"12 interviews, 4 hours of B-roll across 3 locations, one subject broke down crying — we kept rolling."},{k:"STORY",l:"Story in One Sentence",ph:"The moment a community decided it was worth fighting for itself."},{k:"EMOTION",l:"Core Emotion at End",ph:"Defiant hope — not optimism, but the decision to act anyway."}]
  },
  { id:"017", ch:"04", cat:"Post-Production & Editorial",
    name:"The Sound Design Brief",
    desc:"Brief your sound designer with precision — sonic world, ambient layers, music direction, sound as punctuation, and where silence lands hardest.",
    prompt:"You are a sound designer working on a [PROJECT_TYPE]\n\nVisual tone: [VISUAL_TONE]\n\nEmotional arc: From [START_EMOTION] to [END_EMOTION]\n\nCreate a complete sound design brief:\n1. The sonic world — describe the texture in three words, then expand.\n2. The ambient soundscape — layers and how they shift across the arc.\n3. Music direction — specific instruments, tempo, and emotional job at each section.\n4. Sound as punctuation — three specific moments where sound creates an emotional shift that picture alone cannot.\n5. The silence — where it hits hardest and what has just happened.",
    vars:[{k:"PROJECT_TYPE",l:"Project Type",ph:"15-minute documentary short about deep sea researchers"},{k:"VISUAL_TONE",l:"Visual Tone",ph:"Dark, pressurised, beautiful in the way that dangerous things are beautiful"},{k:"START_EMOTION",l:"Starting Emotion",ph:"Clinical scientific detachment"},{k:"END_EMOTION",l:"Ending Emotion",ph:"Something approaching reverence"}]
  },
  { id:"018", ch:"04", cat:"Post-Production & Editorial",
    name:"The Colour Grade Direction",
    desc:"Turn creative intent into technical language your colorist can execute — primary look, scene shifts, hero shot treatment, and what is intentionally NOT done.",
    prompt:"You are a senior colorist being briefed for a [PROJECT_TYPE]\n\nColour palette: [COLOUR_PALETTE]\n\nEmotional arc: [START_EMOTION] to [END_EMOTION]\n\nCreate a complete grade direction:\n1. Primary look — lift/gamma/gain direction, saturation, skin tone treatment.\n2. Scene-by-scene grade shifts — how grade changes and what each change communicates.\n3. Hero shot grade — specific treatment for the most important frame.\n4. What is intentionally NOT done in this grade.\n5. Reference grade — specific film, specific scene, what makes it exceptional.",
    vars:[{k:"PROJECT_TYPE",l:"Project Type",ph:"Narrative short film, 22 minutes, shot on ARRI Alexa Mini LF"},{k:"COLOUR_PALETTE",l:"Colour Palette",ph:"Dominant: warm amber-brown shadows. Accent: institutional green. Suppressed: pure blue."},{k:"START_EMOTION",l:"Starting Emotion",ph:"Warm, domestic, deceptively comfortable"},{k:"END_EMOTION",l:"Ending Emotion",ph:"Cold, institutional — the warmth feels like a lie"}]
  },
  { id:"019", ch:"04", cat:"Post-Production & Editorial",
    name:"The Voiceover Script Writer",
    desc:"Write voiceover copy for the ear — never describes what the viewer can already see. Three versions: long, medium, and 15-second social cut.",
    prompt:"You are a voiceover copywriter with documentary and brand film experience. You write for the ear. You never describe what the viewer can already see.\n\nProject: [PROJECT_TYPE] for [CLIENT_TYPE]\n\nEdit duration: [DURATION]\nVisual story: [STORY]\nEnding emotion: [EMOTION]\n\nWrite a voiceover script that:\n— Runs no longer than [WORD_COUNT]\n— Never describes what the viewer can see\n— Uses sentence fragments when rhythm demands it\n— Never uses: \"passionate,\" \"journey,\" \"dedicated,\" or \"community\"\n— Includes [PAUSE_COUNT] deliberate pauses marked as [PAUSE]\n— Ends on a line that lands before the viewer understands it\n\nWrite three versions: long, medium, and 15-second social cut.\nVoice tone: [TONE]",
    vars:[{k:"PROJECT_TYPE",l:"Project Type",ph:"Brand documentary"},{k:"CLIENT_TYPE",l:"Client Type",ph:"family-owned restaurant, third generation"},{k:"DURATION",l:"Edit Duration",ph:"2 minutes 30 seconds"},{k:"STORY",l:"Visual Story",ph:"A family that has fed the same neighbourhood for 60 years without deciding to stop."},{k:"EMOTION",l:"Ending Emotion",ph:"The particular love of consistency — of being the thing that is always there."},{k:"WORD_COUNT",l:"Max Word Count",ph:"310 words"},{k:"PAUSE_COUNT",l:"Number of Pauses",ph:"4"},{k:"TONE",l:"Voice Tone",ph:"Someone who has eaten here every Sunday for 20 years."}]
  },
  { id:"020", ch:"04", cat:"Post-Production & Editorial",
    name:"The Pacing Analyzer",
    desc:"Diagnose exactly why your edit feels wrong — identify the attention risk, the structural problem, and three specific fixes with emotional justification.",
    prompt:"You are a senior editor reviewing the pacing of a cut.\n\nProject: [DURATION] [PROJECT_TYPE]\n\nCurrent structure: [EDIT_STRUCTURE]\n\nWhat feels wrong: [YOUR_INSTINCT]\n\nDiagnose by:\n1. The exact moment viewer attention is most at risk and why.\n2. The structural reason for the pacing problem.\n3. Three specific edits that fix it — with emotional justification for each.\n4. The one moment in this edit that is working perfectly — protect it.\n5. One counterintuitive suggestion most editors would not try.",
    vars:[{k:"DURATION",l:"Film Duration",ph:"2-minute"},{k:"PROJECT_TYPE",l:"Project Type",ph:"commercial for an insurance brand"},{k:"EDIT_STRUCTURE",l:"Current Edit Structure",ph:"0:00-0:20: Problem statement. 0:20-0:50: Brand solution. 0:50-1:40: Three testimonials, 17 seconds each. 1:40-2:00: Brand close."},{k:"YOUR_INSTINCT",l:"What Feels Wrong",ph:"The middle section drags. By the testimonials I can feel the audience leaving."}]
  },
  { id:"021", ch:"05", cat:"The Business of Filmmaking",
    name:"The Client Proposal Builder",
    desc:"Write a production proposal that communicates your creative vision and justifies your pricing — making saying no genuinely difficult.",
    prompt:"You are a professional filmmaker writing a production proposal.\n\nClient type/industry: [CLIENT]\n\nProject requested: [PROJECT]\n\nYour proposed budget: [BUDGET]\n\nYour creative approach: [CREATIVE_VISION]\n\nWrite a complete production proposal:\n1. The Opening — restates the client's problem so well they feel heard.\n2. Creative Approach — inspiring but not pretentious. No film school jargon.\n3. Scope of Work — deliverables, revision rounds, timeline. Specific enough that scope creep is structurally impossible.\n4. Investment — budget as investment, brief justification for major line items.\n5. The Close — one confident paragraph. Makes the next step feel obvious.\n\nTone: confident, collaborative, specific. Never desperate, never vague.",
    vars:[{k:"CLIENT",l:"Client Type / Industry",ph:"Regional hospital group launching a patient experience campaign"},{k:"PROJECT",l:"Project Description",ph:"Three 90-second films — one per flagship facility. Plus 3 social cuts each."},{k:"BUDGET",l:"Proposed Budget",ph:"$42,000 total"},{k:"CREATIVE_VISION",l:"Creative Vision (2-3 sentences)",ph:"We follow real patients and real staff — no actors, no scripts. Three films, one consistent visual language."}]
  },
  { id:"022", ch:"05", cat:"The Business of Filmmaking",
    name:"The Scope of Work Document",
    desc:"Define exact project boundaries in writing before a single camera rolls — deliverables, revision policy, what's NOT included, and client responsibilities.",
    prompt:"You are creating a scope of work document for an approved project.\n\nClient type: [CLIENT]\nProject: [PROJECT]\nApproved budget: [BUDGET]\nAgreed timeline: [TIMELINE]\n\nCreate a complete SOW document:\n1. Project Summary — exactly what is being produced in one paragraph.\n2. Deliverables — precise list: format, resolution, duration, file type for each.\n3. Production Timeline — key milestones with specific dates.\n4. What IS Included — explicit list.\n5. What is NOT Included — explicit list plus change order process.\n6. Revision Policy — how many rounds, what is a revision vs. a new request, cost of additional rounds.\n7. Client Responsibilities — what the client must provide and by when.",
    vars:[{k:"CLIENT",l:"Client Type",ph:"Regional law firm"},{k:"PROJECT",l:"Project Description",ph:"One 2-minute brand film and 6 social cuts"},{k:"BUDGET",l:"Approved Budget",ph:"$18,500"},{k:"TIMELINE",l:"Agreed Timeline",ph:"Shoot in 3 weeks, deliver in 6 weeks"}]
  },
  { id:"023", ch:"05", cat:"The Business of Filmmaking",
    name:"The Pricing Justification Script",
    desc:"Respond to client pricing pushback with confidence — hold your price, offer one scope reduction, and end with a question that moves things forward.",
    prompt:"You are helping me respond to a client pricing objection.\n\nClient's exact pushback: [CLIENT_WORDS]\n\nMy original quote: [YOUR_PRICE]\nMy experience level: [EXPERIENCE]\nProject type: [PROJECT]\n\nWrite a response that:\n— Acknowledges their concern without apologizing for the price\n— Reframes cost as investment with specific value justification\n— Addresses their specific objection directly\n— Offers one alternative only — reduced scope, NOT a reduced rate\n— Ends with a question that moves the conversation forward\n\nTone: warm, direct, completely without desperation.",
    vars:[{k:"CLIENT_WORDS",l:"Client's Exact Words",ph:'"We love the proposal but your price is about 40% higher than we budgeted. Any flexibility?"'},{k:"YOUR_PRICE",l:"Your Original Quote",ph:"$24,000"},{k:"EXPERIENCE",l:"Your Experience",ph:"8 years, 200+ productions, two national brand campaigns"},{k:"PROJECT",l:"Project Type",ph:"3-day commercial shoot, two-camera doc style"}]
  },
  { id:"024", ch:"05", cat:"The Business of Filmmaking",
    name:"The Difficult Client Response",
    desc:"Handle out-of-scope requests professionally and permanently in writing — referencing your SOW without aggression and presenting a clear path forward.",
    prompt:"Help me write a professional response to a difficult client situation.\n\nThe situation: [SITUATION]\n\nThe SOW states: [SOW_CLAUSE]\n\nWhat I need to communicate: [YOUR_GOAL]\n\nWrite a response that:\n— Is professional and collaborative in tone\n— References the agreed scope without aggression\n— States clearly what is and is not included\n— Presents the path forward as a reasonable next step\n— Leaves the client feeling respected even when the answer is no",
    vars:[{k:"SITUATION",l:"Describe What Happened",ph:"Client approved rough cut in writing. Now, 10 days later, they want to restructure the narrative and add new footage that wasn't shot."},{k:"SOW_CLAUSE",l:"Relevant SOW Clause",ph:"Two rounds of revision included. Structural narrative changes constitute a new creative direction and require a change order."},{k:"YOUR_GOAL",l:"What You Need to Communicate",ph:"This is a change order. I will do the work but it requires a new timeline and additional fee."}]
  },
  { id:"025", ch:"05", cat:"The Business of Filmmaking",
    name:"The Discovery Call Framework",
    desc:"Structure your client discovery call to extract the real information — and know if this is a good-fit client before you write one word of proposal.",
    prompt:"You are helping me prepare for a discovery call with a potential client.\n\nClient type/industry: [CLIENT]\n\nWhat they described in their inquiry: [INITIAL_REQUEST]\n\nGenerate a complete discovery call framework:\n1. The opening question — makes them feel heard before anything practical.\n2. Five questions that reveal the actual creative vision, not just the deliverable.\n3. Three questions that reveal the decision-making process.\n4. Two budget questions — one that surfaces expectation, one that qualifies seriousness.\n5. Two red flag questions — answers that tell you if this is a good-fit client.\n6. The closing question — leads naturally to the next step.\n\nFor each question: what are you listening for in the answer.",
    vars:[{k:"CLIENT",l:"Client Type / Industry",ph:"Regional craft brewery expanding nationally for the first time"},{k:"INITIAL_REQUEST",l:"Their Initial Inquiry",ph:'They want a "brand video" that captures their story. Budget: "flexible." Timeline: "before summer." No other details.'}]
  },
  { id:"026", ch:"06", cat:"Content & Self-Marketing",
    name:"The Case Study Writer",
    desc:"Document a completed project to attract your next ideal client — long form, short form, and social versions from one project.",
    prompt:"You are helping me write a project case study for my filmmaker portfolio.\n\nProject type: [PROJECT_TYPE]\nClient type: [CLIENT_TYPE]\n\nKey production details: [PRODUCTION_DETAILS]\n\nWhat the client was most pleased with: [OUTCOME]\n\nMost interesting problem solved: [PROBLEM_AND_SOLUTION]\n\nWrite: Long form (150 words), Short form (50 words), Social (one line, 160 chars).",
    vars:[{k:"PROJECT_TYPE",l:"Project Type",ph:"Brand documentary for a sustainable fashion label"},{k:"CLIENT_TYPE",l:"Client Type (not the name)",ph:"Direct-to-consumer fashion brand, Series A funded"},{k:"PRODUCTION_DETAILS",l:"Key Production Details (3-5)",ph:"1. Shot in available light across 4 countries in 12 days. 2. No scripted moments. 3. Brand founder cried on camera — we kept it."},{k:"OUTCOME",l:"Client Outcome",ph:"2.3M organic views in first week, credited in their Series B pitch deck"},{k:"PROBLEM_AND_SOLUTION",l:"Most Interesting Problem Solved",ph:"The founder didn't want to be on camera. We spent day 1 talking. By day 2 she had forgotten we were filming."}]
  },
  { id:"027", ch:"06", cat:"Content & Self-Marketing",
    name:"The BTS Hook Generator",
    desc:"Turn behind-the-scenes footage into ranked, scroll-stopping educational hooks for TikTok and Reels — with captions and niche hashtags.",
    prompt:"You are a social media strategist for creative professionals.\n\nI just completed a [PROJECT_TYPE] with these interesting details:\n[PRODUCTION_DETAILS]\n\nMy target audience: [AUDIENCE]\n\nPlatform: [PLATFORM]\n\nGenerate 5 hooks. For each:\n— Opening line: stops scroll, max 8 words, never starts with \"I\"\n— Core story angle\n— Educational payoff: one thing they can use immediately\n— Caption\n— 5 niche hashtags\n\nRank from most to least likely to perform. Explain #1 ranking in detail.",
    vars:[{k:"PROJECT_TYPE",l:"Project Type",ph:"commercial food production for a restaurant brand"},{k:"PRODUCTION_DETAILS",l:"Interesting Details (3-5)",ph:"1. Built a rig to shoot inside a working commercial oven. 2. Used a 1970s vintage lens on a modern Alexa. 3. Hero shot captured in 4 minutes between takes."},{k:"AUDIENCE",l:"Target Audience",ph:"Cinematographers and DPs, 22-40, indie to mid-level commercial tier"},{k:"PLATFORM",l:"Platform",ph:"TikTok and Instagram Reels"}]
  },
  { id:"028", ch:"06", cat:"Content & Self-Marketing",
    name:"The Filmmaker Bio Writer",
    desc:"Write a professional bio that attracts ideal clients — three versions (long, short, social) without the words passionate, storyteller, or journey.",
    prompt:"You are a copywriter specialising in bios for creative professionals. You write bios that attract ideal clients, not industry peers.\n\nI am a [ROLE] based in [LOCATION]\n\nCareer highlights: [HIGHLIGHTS]\n\nMy visual style: [STYLE]\n\nClients I most want to attract: [IDEAL_CLIENT]\n\nWork I most want to do: [IDEAL_PROJECTS]\n\nWrite: Long (150 words), Short (50 words), Social (1 line, 160 chars).\nDo not use: \"passionate,\" \"storyteller,\" \"bringing stories to life.\"",
    vars:[{k:"ROLE",l:"Your Role",ph:"Cinematographer and director"},{k:"LOCATION",l:"Your Location",ph:"Atlanta, Georgia"},{k:"HIGHLIGHTS",l:"Career Highlights (3-5)",ph:"1. 10 years commercial and documentary. 2. Work screened at Sundance, 2022. 3. Shot campaigns for luxury and wellness brands."},{k:"STYLE",l:"Visual Style (3 adjectives)",ph:"Intimate. Deliberate. Emotionally specific."},{k:"IDEAL_CLIENT",l:"Ideal Clients",ph:"Brands that make things with their hands. Non-profits. Independent films with real stories."},{k:"IDEAL_PROJECTS",l:"Ideal Projects",ph:"Documentary features. Long-form brand films. Anything requiring real time with real people."}]
  },
  { id:"029", ch:"06", cat:"Content & Self-Marketing",
    name:"The Reel Breakdown Post",
    desc:"Turn one reel release into a multi-post series — each post breaking down a specific shot with an educational payoff that builds anticipation for the next.",
    prompt:"I just released a new [REEL_TYPE] reel featuring:\n[REEL_CONTENTS]\n\nMost interesting element visible: [KEY_ELEMENT]\n\nGenerate a [POST_COUNT]-post breakdown series for [PLATFORM]\n\nFor each post:\n— The specific shot or moment being broken down\n— Opening hook (tension or question, never \"here's how\")\n— The breakdown: accessible but not dumbed down\n— The transferable lesson\n— Caption and 5 hashtags\n— How this post builds anticipation for the next\n\nFinal post: CTA driving toward [CTA_ACTION]",
    vars:[{k:"REEL_TYPE",l:"Reel Type",ph:"cinematography"},{k:"REEL_CONTENTS",l:"Reel Contents",ph:"Commercial brand films, one documentary short, two music videos — 3 years of work. Consistent use of practicals, motivated movement, 2.39:1."},{k:"KEY_ELEMENT",l:"Most Interesting Element",ph:"Every film uses available or practical light only. A creative constraint I imposed 2 years ago."},{k:"POST_COUNT",l:"Number of Posts",ph:"6"},{k:"PLATFORM",l:"Platform",ph:"TikTok and Instagram Reels"},{k:"CTA_ACTION",l:"CTA Action",ph:"DM for commercial rates / visit cinefypro.co"}]
  },
  { id:"030", ch:"06", cat:"Content & Self-Marketing",
    name:"The Content Calendar Builder",
    desc:"Build a 30-day content calendar that balances education, personal story, BTS, and soft promotion — structured like a filmmaker's feed, not a brand account.",
    prompt:"You are a content strategist building a 30-day social calendar for a filmmaker.\n\nContent assets I have: [ASSETS]\n\nPosting goal: [FREQUENCY] across [PLATFORMS]\n\nAudience: [AUDIENCE]\n\nPrimary goal this month: [GOAL]\n\nBuild a 30-day calendar. For each post:\nDay and platform / Content type / Hook / Core message / CTA\n\nMust include:\n— At least [EDU_COUNT] purely educational posts with no promotion\n— At least [STORY_COUNT] personal story posts\n— No more than [PROMO_COUNT] direct promotional posts per week\n— One weekly post designed specifically to be saved or shared\n\nNo two consecutive posts same content type. This should feel like a filmmaker's feed. Not a brand's.",
    vars:[{k:"ASSETS",l:"Content Assets You Have",ph:"3 recent shoots with BTS footage, 1 case study, 2 opinions on AI filmmaking, 1 just-released reel"},{k:"FREQUENCY",l:"Posting Frequency",ph:"4 times per week"},{k:"PLATFORMS",l:"Platforms",ph:"TikTok and Instagram Reels"},{k:"AUDIENCE",l:"Your Audience",ph:"Working and aspiring filmmakers, 22-40, mix of beginners and mid-level professionals"},{k:"GOAL",l:"Monthly Goal",ph:"Drive traffic to cinefypro.co to sell The Filmmaker's AI Prompt Bible"},{k:"EDU_COUNT",l:"Min Educational Posts",ph:"8"},{k:"STORY_COUNT",l:"Min Story Posts",ph:"4"},{k:"PROMO_COUNT",l:"Max Promo Posts/Week",ph:"1"}]
  },
  { id:"031", ch:"06", cat:"Content & Self-Marketing",
    name:"The Ad Campaign Builder",
    desc:"Build a complete ad campaign brief — concept, scene breakdown, shot list, music direction, and 15-second cut — ready to hand to a director or client.",
    prompt:"You are a senior creative director building a full ad campaign brief for a brand film.\n\nBrand / Client: [BRAND]\n\nProduct or launch: [PRODUCT]\n\nTarget audience: [AUDIENCE]\n\nAd duration: [DURATION]\n\nThe core emotion this ad must leave the viewer feeling: [EMOTION]\n\nVisual and cinematic style: [VISUAL_STYLE]\n\nBuild a complete campaign brief including:\n1. CONCEPT — the single emotional idea the entire ad is built on.\n2. SCENE BREAKDOWN — 5 scenes with visual, audio, VO, and director notes.\n3. SHOT LIST — 10 shots with type, description, and duration.\n4. MUSIC DIRECTION — phase-by-phase sound design brief.\n5. 15-SECOND CUT — compressed social version with notes.\n\nEvery scene must serve the emotional arc. No filler. Write like a director who has made this ad a hundred times.",
    vars:[
      {k:"BRAND",l:"Brand / Client",ph:"Cinefy"},
      {k:"PRODUCT",l:"Product or Launch",ph:"The Filmmaker's AI Bible — new product launch"},
      {k:"AUDIENCE",l:"Target Audience",ph:"Working and aspiring filmmakers, 22–40"},
      {k:"DURATION",l:"Ad Duration",ph:"60 seconds"},
      {k:"EMOTION",l:"Core Emotion",ph:"The relief of finally having a system — like the first breath after being underwater"},
      {k:"VISUAL_STYLE",l:"Visual Style",ph:"Dark, intimate, cinematic. Filmmaker at desk. Monitor glow as key light. Deakins-level restraint."},
    ]
  }
];

const CATS = [...new Set(PROMPTS.map(p => p.cat).filter(Boolean))];
const CH_NAMES = {"01":"Pre-Production","02":"Cinematography","03":"AI Video Tools","04":"Post-Production","05":"Business","06":"Marketing"};

function fillPrompt(template, values) {
  if (!template) return '';
  let result = template;
  Object.entries(values).forEach(([k, v]) => {
    if (v) result = result.replaceAll(`[${k}]`, v);
  });
  return result;
}

// ── LANDING PAGE ─────────────────────────────────────────

// ── FREE DEMO — PROMPT 006 ────────────────────────────────
function FreeDemo006({ onUnlock }) {
  const [scene, setScene] = useState("Interior interview. Female CEO, 45. Feeling: authoritative but warm. Modern corner office, two floor-to-ceiling windows facing north.");
  const [tone, setTone] = useState("Quietly powerful — available-feeling light that is precisely controlled.");
  const [equipment, setEquipment] = useState("Two ARRI SkyPanel S60s, two 4x4 bounce frames, one negative fill flag.");
  const [copied, setCopied] = useState(false);

  const prompt = `You are a professional gaffer and DP designing a lighting setup for this scene:

${scene}

Emotional tone: ${tone}

Available equipment: ${equipment}

Design a complete lighting setup:
1. Key light — position, quality, modifier, colour temp, and why.
2. Fill or negative fill — approach and ratio.
3. Background treatment — lit or unlit and what each communicates.
4. Practical lights — in-scene sources and how they are enhanced.
5. One film reference scene this setup is inspired by.
6. What changes if the subject moves 2 feet toward the window.`;

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleEmailSubmit = async () => {
    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setSendingEmail(true);
    setEmailError("");
    try {
      const res = await fetch("https://formspree.io/f/xjgazdvz", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          email,
          source: "Cinefy Free PDF — Prompt 006 Lighting Setup Designer",
          timestamp: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setEmailSent(true);
        setTimeout(() => {
          setShowEmailModal(false);
          generatePDF006();
        }, 1200);
      } else {
        setEmailError("Something went wrong. Please try again.");
      }
    } catch {
      // If Formspree not set up yet, still download the PDF
      setEmailSent(true);
      setTimeout(() => {
        setShowEmailModal(false);
        generatePDF006();
      }, 1200);
    }
    setSendingEmail(false);
  };

  const generatePDF006 = async () => {
    const jsPDF = await new Promise((resolve, reject) => {
      if (window.jspdf) { resolve(window.jspdf.jsPDF); return; }
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = () => resolve(window.jspdf.jsPDF);
      s.onerror = reject;
      document.head.appendChild(s);
    });
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210, H = 297, ML = 16, IW = 178;
    // Dark header
    doc.setFillColor(7,7,13); doc.rect(0,0,W,H,"F");
    doc.setFillColor(13,13,26); doc.rect(0,0,W,22,"F");
    doc.setFillColor(79,195,247); doc.rect(0,22,W,0.8,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(11);
    doc.setTextColor(240,240,248); doc.text("CINEFY",ML,14);
    doc.setFont("helvetica","normal"); doc.setFontSize(7);
    doc.setTextColor(90,90,122); doc.text("CINEFYPRO.CO",W-ML,14,{align:"right"});
    // Title block
    doc.setFillColor(17,17,32); doc.rect(0,22.8,W,20,"F");
    doc.setFillColor(30,30,53); doc.rect(0,42.8,W,0.3,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(16);
    doc.setTextColor(240,240,248); doc.text("LIGHTING SETUP DESIGNER",ML,34);
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5);
    doc.setTextColor(90,90,122);
    doc.text("PROMPT 006  ·  CINEMATOGRAPHY & VISUAL LANGUAGE  ·  " + new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),ML,40);
    let y = 52;
    // Scene details
    const fields = [
      ["SCENE DESCRIPTION", scene],
      ["EMOTIONAL TONE", tone],
      ["EQUIPMENT", equipment],
    ];
    fields.forEach(([label, val]) => {
      doc.setFillColor(17,17,32); doc.setDrawColor(30,30,53); doc.setLineWidth(0.3);
      const lines = doc.splitTextToSize(val || "—", IW-12);
      const h = Math.max(12, lines.length*5+8);
      doc.roundedRect(ML,y,IW,h,1.5,1.5,"FD");
      doc.setFillColor(79,195,247); doc.rect(ML,y,2.5,h,"F");
      doc.setFont("helvetica","bold"); doc.setFontSize(7);
      doc.setTextColor(79,195,247); doc.text(label,ML+5,y+5);
      doc.setFont("helvetica","normal"); doc.setFontSize(9);
      doc.setTextColor(176,176,204); doc.text(lines,ML+5,y+10);
      y += h+4;
    });
    y += 4;
    // Prompt section
    doc.setFillColor(4,4,15); doc.setDrawColor(255,179,71); doc.setLineWidth(0.5);
    const pLines = doc.splitTextToSize(prompt, IW-12);
    const pH = Math.min(pLines.length*4.8+16, H-y-20);
    doc.roundedRect(ML,y,IW,pH,2,2,"FD");
    doc.setFillColor(255,179,71); doc.rect(ML,y,2.5,pH,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5);
    doc.setTextColor(255,179,71); doc.text("COMPLETE PROMPT  ·  COPY INTO CHATGPT, CLAUDE OR GEMINI",ML+5,y+6);
    doc.setFillColor(42,26,0); doc.rect(ML+4,y+8,IW-8,0.4,"F");
    doc.setFont("helvetica","normal"); doc.setFontSize(8.5);
    doc.setTextColor(212,192,144);
    const visibleLines = pLines.slice(0, Math.floor((pH-14)/4.8));
    doc.text(visibleLines,ML+5,y+13);
    // Footer
    doc.setFillColor(13,13,26); doc.rect(0,H-10,W,10,"F");
    doc.setFillColor(79,195,247); doc.rect(0,H-10,W,0.6,"F");
    doc.setFont("helvetica","normal"); doc.setFontSize(6.5);
    doc.setTextColor(90,90,122);
    doc.text("CINEFY  ·  THE FILMMAKER\'S AI BIBLE  ·  CINEFYPRO.CO  ·  STOP STARTING FROM SCRATCH",W/2,H-4,{align:"center"});
    doc.save("cinefy-lighting-setup-prompt-006.pdf");
  };

  return (
    <div style={{
      background:"#07070F", border:"1px solid #141428",
      borderRadius:12, overflow:"hidden",
      fontFamily:"'DM Sans', sans-serif"
    }}>
      <style>{`
        .fd-input {
          background: #040408; border: 1px solid #1A1A32;
          color: #F0F0F8; font-family: DM Sans; font-size: 14px;
          width: 100%; padding: 12px 16px; border-radius: 6px;
          outline: none; resize: vertical; line-height: 1.6;
          transition: border-color 0.15s;
        }
        .fd-input:focus { border-color: #4FC3F7; }
      `}</style>

      {/* Header */}
      <div style={{
        background:"#0A0A18", borderBottom:"1px solid #111120",
        padding:"16px 24px", display:"flex", alignItems:"center",
        justifyContent:"space-between", flexWrap:"wrap", gap:10
      }}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{fontSize:10, fontWeight:700, letterSpacing:"0.1em", color:"#4FC3F7", background:"rgba(79,195,247,0.1)", padding:"3px 10px", borderRadius:3}}>
            PROMPT 006
          </div>
          <span style={{fontSize:15, fontWeight:700, color:"#F0F0F8"}}>The Lighting Setup Designer</span>
        </div>
        <span style={{fontSize:12, color:"#5BE06A", fontWeight:600}}>FREE TO TRY</span>
      </div>

      <div style={{padding:"24px"}}>
        {/* Inputs */}
        <div style={{display:"grid", gap:16, marginBottom:20}}>
          <div>
            <label style={{display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.08em", color:"#5A5A7A", marginBottom:8}}>
              [SCENE_DESCRIPTION] — Describe the scene
            </label>
            <textarea className="fd-input" rows={3} value={scene} onChange={e => setScene(e.target.value)} />
          </div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
            <div>
              <label style={{display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.08em", color:"#5A5A7A", marginBottom:8}}>
                [TONE] — Emotional tone
              </label>
              <textarea className="fd-input" rows={2} value={tone} onChange={e => setTone(e.target.value)} />
            </div>
            <div>
              <label style={{display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.08em", color:"#5A5A7A", marginBottom:8}}>
                [EQUIPMENT] — Available equipment
              </label>
              <textarea className="fd-input" rows={2} value={equipment} onChange={e => setEquipment(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Output preview */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11, fontWeight:700, letterSpacing:"0.08em", color:"#6060808", marginBottom:10}}>
            YOUR PROMPT — READY TO COPY
          </div>
          <div style={{
            background:"#040408", border:"1px solid #1A1A32",
            borderLeft:"2px solid #4FC3F7", borderRadius:6,
            padding:"16px 18px", fontSize:13, color:"#8080A8",
            lineHeight:1.8, whiteSpace:"pre-wrap", maxHeight:200,
            overflow:"auto", fontFamily:"DM Sans"
          }}>{prompt}</div>
        </div>

                {/* EMAIL CAPTURE MODAL */}
        {showEmailModal && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:24}}>
            <div style={{background:"#0A0A16",border:"1px solid #1A1A32",borderRadius:12,padding:"36px 32px",maxWidth:420,width:"100%"}}>
              {emailSent ? (
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:"Bebas Neue",fontSize:28,color:"#5BE06A",letterSpacing:"0.06em",marginBottom:8}}>Generating PDF...</div>
                  <p style={{fontSize:14,color:"#7A7A9A"}}>Your download will start automatically.</p>
                </div>
              ) : (
                <>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:"#FFB347",background:"rgba(255,179,71,0.08)",border:"1px solid rgba(255,179,71,0.2)",padding:"4px 12px",borderRadius:4,display:"inline-block",marginBottom:16}}>FREE DOWNLOAD</div>
                  <h3 style={{fontFamily:"Bebas Neue",fontSize:26,letterSpacing:"0.04em",color:"#F0F0F8",marginBottom:8}}>Get Your Branded PDF</h3>
                  <p style={{fontSize:14,color:"#7A7A9A",lineHeight:1.65,marginBottom:24}}>Enter your email to download the client-ready Lighting Setup PDF. We will notify you when new free prompts drop.</p>
                  <input type="email" placeholder="your@email.com" value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleEmailSubmit()}
                    style={{background:"#040408",border:"1px solid #1A1A32",color:"#F0F0F8",fontFamily:"DM Sans",fontSize:15,width:"100%",padding:"14px 16px",borderRadius:6,outline:"none",marginBottom:10}}
                  />
                  {emailError && <p style={{fontSize:12,color:"#FF6B6B",marginBottom:10}}>{emailError}</p>}
                  <button onClick={handleEmailSubmit} disabled={sendingEmail}
                    style={{width:"100%",background:"#FFB347",color:"#07070D",fontFamily:"DM Sans",fontWeight:700,fontSize:15,padding:"14px",borderRadius:6,border:"none",cursor:"pointer",marginBottom:10,opacity:sendingEmail?0.6:1}}>
                    {sendingEmail ? "Processing..." : "Download PDF — Free"}
                  </button>
                  <button onClick={() => setShowEmailModal(false)}
                    style={{width:"100%",background:"transparent",border:"1px solid #1A1A32",color:"#7A7A9A",fontFamily:"DM Sans",fontSize:14,padding:"10px",borderRadius:6,cursor:"pointer"}}>
                    Cancel
                  </button>
                  <p style={{fontSize:11,color:"#3A3A5A",textAlign:"center",marginTop:12}}>No spam. Unsubscribe anytime.</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{display:"flex", gap:10, flexWrap:"wrap", alignItems:"center"}}>
          <button onClick={copy}
            style={{background:copied?"rgba(91,224,106,0.1)":"#4FC3F7",color:copied?"#5BE06A":"#07070D",border:copied?"1px solid #5BE06A":"none",fontFamily:"DM Sans",fontWeight:700,fontSize:15,padding:"13px 24px",borderRadius:6,cursor:"pointer",transition:"all 0.15s"}}>
            {copied ? "Copied ✓" : "Copy Prompt — Free"}
          </button>
          <button onClick={() => setShowEmailModal(true)}
            style={{background:"transparent",border:"1px solid #FFB347",color:"#FFB347",fontFamily:"DM Sans",fontWeight:700,fontSize:14,padding:"13px 20px",borderRadius:6,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download PDF
          </button>
          <button onClick={onUnlock}
            style={{background:"transparent",border:"1px solid #1A1A32",color:"#9090B0",fontFamily:"DM Sans",fontWeight:500,fontSize:14,padding:"13px 20px",borderRadius:6,cursor:"pointer"}}>
            Unlock all 30 →
          </button>
        </div>
        <p style={{fontSize:12,color:"#4A4A6A",marginTop:14}}>
          Paste into ChatGPT, Claude, or Gemini · Unlock all 30 prompts at cinefypro.co
        </p>
      </div>
    </div>
  );
}


function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Landing({ onBuy, onEnterGate }) {
  return (
    <div style={{background:"#07070D", color:"#F0F0F8", fontFamily:"'DM Sans', sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #1A1A2E; }

        .lp-nav-link {
          background: none; border: none; color: #4A4A6A;
          font-family: DM Sans; font-size: 14px; font-weight: 500;
          cursor: pointer; padding: 0; transition: color 0.15s; letter-spacing: 0.01em;
        }
        .lp-nav-link:hover { color: #F0F0F8; }

        .lp-btn {
          background: #4FC3F7; color: #07070D;
          font-family: DM Sans; font-weight: 700; font-size: 15px;
          padding: 13px 28px; border-radius: 8px; border: none;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
          letter-spacing: 0.01em; white-space: nowrap;
        }
        .lp-btn:hover { background: #7DD4F8; transform: translateY(-1px); }
        .lp-btn:active { transform: translateY(0); }

        .lp-btn-lg {
          background: #4FC3F7; color: #07070D;
          font-family: DM Sans; font-weight: 700; font-size: 17px;
          padding: 17px 40px; border-radius: 8px; border: none;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
          letter-spacing: 0.01em; display: inline-block;
        }
        .lp-btn-lg:hover { background: #7DD4F8; transform: translateY(-1px); }

        .lp-rule { height: 1px; background: #0D0D1C; }

        .lp-card {
          background: #0A0A16; border: 1px solid #0F0F1E;
          border-radius: 10px; padding: 28px 24px;
          transition: border-color 0.2s;
        }
        .lp-card:hover { border-color: #1A1A2E; }

        .lp-feature-row {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 0; border-bottom: 1px solid #0A0A16;
        }
        .lp-feature-row:last-child { border-bottom: none; }

        .lp-ch-row {
          display: flex; align-items: baseline; gap: 12px;
          padding: 12px 0; border-bottom: 1px solid #0A0A16;
        }
        .lp-ch-row:last-child { border-bottom: none; }

        @keyframes lp-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .u1 { animation: lp-up 0.55s 0.05s both; }
        .u2 { animation: lp-up 0.55s 0.18s both; }
        .u3 { animation: lp-up 0.55s 0.30s both; }
        .u4 { animation: lp-up 0.55s 0.42s both; }

        .lp-ticker {
          overflow: hidden; border-top: 1px solid #0D0D1C;
          border-bottom: 1px solid #0D0D1C; padding: 9px 0;
          background: #050509;
        }
        .lp-ticker-inner {
          display: flex; white-space: nowrap;
          animation: lp-ticker 36s linear infinite;
        }
        @keyframes lp-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .lp-ticker-item {
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
          color: #1E1E2E; text-transform: uppercase;
          margin-right: 36px; flex-shrink: 0;
        }

        .lp-pricing {
          background: #0A0A16; border: 1px solid #141428;
          border-radius: 12px; padding: 40px 36px;
          max-width: 420px; margin: 0 auto; position: relative;
        }
        .lp-pricing::before {
          content: ""; position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #4FC3F7 40%, transparent);
        }

        @media (max-width: 820px) {
          .lp-two { grid-template-columns: 1fr !important; }
          .lp-three { grid-template-columns: 1fr !important; }
          .lp-hide { display: none !important; }
          .lp-hero-cta { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position:"sticky", top:0, zIndex:200,
        background:"rgba(7,7,13,0.97)", backdropFilter:"blur(20px)",
        borderBottom:"1px solid #0D0D1C",
        height:58, display:"flex", alignItems:"center",
        padding:"0 clamp(20px,4vw,56px)", justifyContent:"space-between"
      }}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{
            width:28, height:28, borderRadius:"50%",
            border:"1.5px solid #4FC3F7",
            display:"flex", alignItems:"center", justifyContent:"center"
          }}>
            <div style={{width:9, height:9, background:"#FFB347", borderRadius:"50%"}} />
          </div>
          <span style={{fontFamily:"Bebas Neue", fontSize:19, letterSpacing:"0.14em", color:"#F0F0F8"}}>CINEFY</span>
        </div>

        <div className="lp-hide" style={{display:"flex", gap:36, alignItems:"center"}}>
          <button className="lp-nav-link" onClick={() => document.getElementById("problem")?.scrollIntoView({behavior:"smooth"})}>Why Cinefy</button>
          <button className="lp-nav-link" onClick={() => document.getElementById("inside")?.scrollIntoView({behavior:"smooth"})}>What's Inside</button>
          <button className="lp-nav-link" onClick={() => document.getElementById("pricing")?.scrollIntoView({behavior:"smooth"})}>Pricing</button>
        </div>

        <button className="lp-btn" onClick={onEnterGate}>Try Free</button>
      </nav>

      {/* ── TICKER ── */}
      <div className="lp-ticker">
        <div className="lp-ticker-inner">
          {[...Array(2)].map((_,i) => (
            <div key={i} style={{display:"flex"}}>
              {["Shot Lists","Lighting Briefs","Visual Bibles","Client Proposals","Sound Design Briefs","Colour Grade Direction","Campaign Briefs","Voiceover Scripts","Reel Breakdowns","Mood Board Briefs"].map((t,j) => (
                <span key={j} className="lp-ticker-item">{t}<span style={{color:"#4FC3F7",marginLeft:36}}>—</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <section style={{
        padding:"clamp(80px,12vw,130px) clamp(20px,5vw,56px) clamp(72px,10vw,110px)",
        maxWidth:1000, margin:"0 auto"
      }}>
        <div className="u1" style={{marginBottom:20}}>
          <span style={{
            fontSize:11, fontWeight:700, letterSpacing:"0.12em",
            color:"#4FC3F7", textTransform:"uppercase"
          }}>The Filmmaker's AI Bible</span>
        </div>

        <h1 className="u2" style={{
          fontFamily:"Bebas Neue",
          fontSize:"clamp(56px,10vw,104px)",
          lineHeight:0.9, letterSpacing:"0.02em",
          color:"#F0F0F8", marginBottom:28,
          maxWidth:820
        }}>
          The documents you need.<br />
          <span style={{color:"#4FC3F7"}}>Generated instantly.</span>
        </h1>

        <p className="u3" style={{
          fontSize:"clamp(16px,2vw,20px)", color:"#5A5A7A",
          lineHeight:1.7, maxWidth:520, marginBottom:44
        }}>
          Shot lists, lighting briefs, visual bibles, client proposals — written in the precise technical language of professional cinema. What used to take hours now takes seconds.
        </p>

        <div className="u4 lp-hero-cta" style={{display:"flex", alignItems:"center", gap:16, flexWrap:"wrap"}}>
          <button className="lp-btn-lg" onClick={onEnterGate}>
            Try the Studio Free
          </button>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <div style={{width:5, height:5, borderRadius:"50%", background:"#5BE06A"}} />
            <span style={{fontSize:13, color:"#3A3A5A", fontWeight:500}}>Beta access · No card required</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display:"flex", gap:"clamp(32px,5vw,64px)",
          marginTop:64, paddingTop:40,
          borderTop:"1px solid #0D0D1C", flexWrap:"wrap"
        }}>
          {[["30","Prompts"],["6","Chapters"],["PDF","Export"],["0","Guesswork"]].map(([v,l]) => (
            <div key={l}>
              <div style={{fontFamily:"Bebas Neue", fontSize:36, color:"#F0F0F8", lineHeight:1}}>{v}</div>
              <div style={{fontSize:11, fontWeight:600, color:"#2A2A3A", letterSpacing:"0.1em", marginTop:5}}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="lp-rule" />

      {/* ── PROBLEM ── */}
      <section id="problem" style={{padding:"80px clamp(20px,5vw,56px)", maxWidth:1000, margin:"0 auto"}}>
        <div style={{maxWidth:520, marginBottom:56}}>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:"#3A3A5A",textTransform:"uppercase",display:"block",marginBottom:14}}>The Problem</span>
          <h2 style={{fontFamily:"Bebas Neue",fontSize:"clamp(34px,5.5vw,58px)",letterSpacing:"0.03em",lineHeight:0.95,color:"#F0F0F8",marginBottom:16}}>
            Every filmmaker knows this wall.
          </h2>
          <p style={{fontSize:16,color:"#4A4A6A",lineHeight:1.75}}>
            The vision is clear. The gear is ready. But the documents that get a project from your head to the set — the briefs, the shot lists, the proposals — take hours to write and rarely come out sounding like a professional made them.
          </p>
        </div>

        <div className="lp-three" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {[
            {col:"#4FC3F7",title:"Blank page syndrome",body:"Every project starts from zero. The same research, the same structure, rebuilt from scratch every single time."},
            {col:"#FFB347",title:"Generic AI output",body:"Standard prompts produce standard results. Output that sounds like a stock photo caption, not a DP brief."},
            {col:"#5BE06A",title:"Hours you don't have",body:"Writing documents that clients and crew actually respect takes time that should be spent on the work itself."},
          ].map(c => (
            <div key={c.title} className="lp-card">
              <div style={{width:20,height:1,background:c.col,marginBottom:20}} />
              <div style={{fontSize:15,fontWeight:700,color:"#E0E0F0",marginBottom:10,lineHeight:1.3}}>{c.title}</div>
              <div style={{fontSize:14,color:"#4A4A6A",lineHeight:1.7}}>{c.body}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="lp-rule" />

      {/* ── WHAT IT DOES ── */}
      <section style={{padding:"80px clamp(20px,5vw,56px)",background:"#050509"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{maxWidth:560,marginBottom:56}}>
            <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:"#3A3A5A",textTransform:"uppercase",display:"block",marginBottom:14}}>The Solution</span>
            <h2 style={{fontFamily:"Bebas Neue",fontSize:"clamp(34px,5.5vw,58px)",letterSpacing:"0.03em",lineHeight:0.95,color:"#F0F0F8",marginBottom:16}}>
              Not a prompt pack.<br />A professional output system.
            </h2>
            <p style={{fontSize:16,color:"#4A4A6A",lineHeight:1.75}}>
              Every prompt in Cinefy is engineered in the precise vocabulary of professional cinema. Fill in your project details. Get a document you can hand to a client or crew immediately.
            </p>
          </div>

          <div className="lp-two" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {[
              {col:"#4FC3F7",icon:"→",title:"Client-ready on every prompt",body:"Not a starting point. A finished document. The kind of output that makes clients trust you before a camera rolls."},
              {col:"#4FC3F7",icon:"→",title:"Film vocabulary, not AI slop",body:"The outputs reference real DPs, real films, real ratios. It reads like a DP wrote it because it was trained to speak that language."},
              {col:"#FFB347",icon:"→",title:"Interactive — not a PDF",body:"Edit any word before you copy. Customise every variable. The prompt adapts to your project, not the other way around."},
              {col:"#5BE06A",icon:"→",title:"Client-ready PDF export",body:"On key prompts, generate a branded Cinefy PDF you can attach to an email and send to a client or department head immediately."},
            ].map(c => (
              <div key={c.title} className="lp-card">
                <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                  <div style={{
                    width:28,height:28,borderRadius:6,
                    background:`${c.col}10`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    flexShrink:0,marginTop:2
                  }}>
                    <span style={{color:c.col,fontSize:14,fontWeight:700}}>{c.icon}</span>
                  </div>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:"#E0E0F0",marginBottom:8,lineHeight:1.3}}>{c.title}</div>
                    <div style={{fontSize:14,color:"#4A4A6A",lineHeight:1.7}}>{c.body}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="lp-rule" />

      {/* ── WHAT'S INSIDE ── */}
      <section id="inside" style={{padding:"80px clamp(20px,5vw,56px)",maxWidth:1000,margin:"0 auto"}}>
        <div style={{maxWidth:480,marginBottom:56}}>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:"#3A3A5A",textTransform:"uppercase",display:"block",marginBottom:14}}>What's Inside</span>
          <h2 style={{fontFamily:"Bebas Neue",fontSize:"clamp(34px,5.5vw,58px)",letterSpacing:"0.03em",lineHeight:0.95,color:"#F0F0F8"}}>
            30 prompts.<br />6 chapters.<br />Every stage of production.
          </h2>
        </div>

        <div className="lp-two" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[
            {ch:"01",col:"#4FC3F7",title:"Pre-Production & Vision",items:["The Brief Decoder","The Shot List Generator","The Visual Bible Builder","The Emotional Shot List","The Mood Board Brief"]},
            {ch:"02",col:"#4FC3F7",title:"Cinematography & Visual Language",items:["The Lighting Setup Designer","The Camera Movement Sequence","The Lens Language Advisor","The Colour Palette Generator","The Film Reference Matcher"]},
            {ch:"03",col:"#B48EF7",title:"AI Video Tool Prompts",items:["The Runway Cinematic Formula","The Sora Scene Builder","The Hero Shot Generator","The Transition Sequence Prompt","The BTS Content Generator"]},
            {ch:"04",col:"#FFB347",title:"Post-Production & Editorial",items:["The Edit Structure Planner","The Sound Design Brief","The Colour Grade Direction","The Voiceover Script Writer","The Pacing Analyzer"]},
            {ch:"05",col:"#FFB347",title:"The Business of Filmmaking",items:["The Client Proposal Builder","The Scope of Work Document","The Pricing Justification Script","The Difficult Client Response","The Discovery Call Framework"]},
            {ch:"06",col:"#5BE06A",title:"Content & Self-Marketing",items:["The Case Study Writer","The BTS Hook Generator","The Filmmaker Bio Writer","The Reel Breakdown Post","The Content Calendar Builder"]},
          ].map(ch => (
            <div key={ch.ch} style={{
              background:"#0A0A14",border:"1px solid #0D0D1C",
              borderRadius:10,padding:"22px 24px"
            }}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <div style={{
                  width:4,height:16,borderRadius:2,
                  background:ch.col,flexShrink:0
                }} />
                <span style={{fontSize:11,fontWeight:700,color:ch.col,letterSpacing:"0.08em"}}>CH {ch.ch}</span>
                <span style={{fontSize:13,fontWeight:600,color:"#C0C0D8"}}>{ch.title}</span>
              </div>
              {ch.items.map(item => (
                <div key={item} className="lp-ch-row">
                  <div style={{width:3,height:3,borderRadius:"50%",background:"#1E1E2E",flexShrink:0}} />
                  <span style={{fontSize:13,color:"#4A4A6A"}}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <div className="lp-rule" />

      {/* ── PRICING ── */}
      <section id="pricing" style={{padding:"80px clamp(20px,5vw,56px)",background:"#050509"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{maxWidth:420,marginBottom:56}}>
            <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:"#3A3A5A",textTransform:"uppercase",display:"block",marginBottom:14}}>Pricing</span>
            <h2 style={{fontFamily:"Bebas Neue",fontSize:"clamp(34px,5.5vw,58px)",letterSpacing:"0.03em",lineHeight:0.95,color:"#F0F0F8",marginBottom:16}}>
              Simple pricing.<br />No subscription.
            </h2>
            <p style={{fontSize:16,color:"#4A4A6A",lineHeight:1.75}}>
              One price. All 30 prompts. The full studio. Yours forever.
            </p>
          </div>

          <div className="lp-pricing">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:"#3A3A5A",marginBottom:10}}>THE FILMMAKER'S AI BIBLE</div>
                <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                  <span style={{fontFamily:"Bebas Neue",fontSize:72,color:"#F0F0F8",lineHeight:1}}>$29</span>
                  <div>
                    <div style={{fontSize:16,color:"#1E1E2E",textDecoration:"line-through"}}>$49</div>
                    <div style={{fontSize:11,fontWeight:700,color:"#5BE06A",letterSpacing:"0.06em"}}>SAVE $20</div>
                  </div>
                </div>
                <div style={{fontSize:12,color:"#2A2A3A",marginTop:4}}>Launch price · One-time · No subscription</div>
              </div>
              <div style={{
                background:"rgba(255,179,71,0.06)",border:"1px solid rgba(255,179,71,0.15)",
                borderRadius:6,padding:"8px 14px",textAlign:"center"
              }}>
                <div style={{fontSize:10,fontWeight:700,color:"#FFB347",letterSpacing:"0.08em"}}>LAUNCH</div>
                <div style={{fontSize:10,color:"#4A4A4A",marginTop:2}}>Price rises to $49</div>
              </div>
            </div>

            <div style={{marginBottom:28}}>
              {[
                ["30 professional filmmaking prompts","#5BE06A"],
                ["6 complete production chapters","#5BE06A"],
                ["Interactive studio — not a PDF","#5BE06A"],
                ["Live prompt editing before you copy","#5BE06A"],
                ["Branded PDF export on key prompts","#5BE06A"],
                ["Works with ChatGPT, Claude & Gemini","#5BE06A"],
                ["Instant access · Yours forever","#5BE06A"],
              ].map(([f,c]) => (
                <div key={f} className="lp-feature-row">
                  <div style={{width:5,height:5,borderRadius:"50%",background:c,flexShrink:0}} />
                  <span style={{fontSize:15,color:"#8080A0"}}>{f}</span>
                </div>
              ))}
            </div>

            <button className="lp-btn-lg" style={{width:"100%"}} onClick={onBuy}>
              Get The Filmmaker's Bible — $29
            </button>
            <p style={{fontSize:11,color:"#2A2A3A",textAlign:"center",marginTop:12}}>Instant delivery · cinefypro.co</p>
          </div>
        </div>
      </section>

      <div className="lp-rule" />

      {/* ── GUARANTEE ── */}
      <section style={{padding:"56px clamp(20px,5vw,56px)",maxWidth:1000,margin:"0 auto"}}>
        <div style={{
          display:"flex",alignItems:"center",gap:20,
          maxWidth:600,flexWrap:"wrap"
        }}>
          <div style={{
            width:40,height:40,borderRadius:"50%",
            border:"1px solid #1A1A2E",
            display:"flex",alignItems:"center",justifyContent:"center",
            flexShrink:0
          }}>
            <div style={{width:14,height:14,borderRadius:"50%",border:"1.5px solid #5BE06A"}} />
          </div>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:"#E0E0F0",marginBottom:4}}>7-Day Money-Back Guarantee</div>
            <div style={{fontSize:14,color:"#4A4A6A",lineHeight:1.65}}>If Cinefy does not save you time and improve your client deliverables, email us within 7 days for a full refund.</div>
          </div>
        </div>
      </section>

      <div className="lp-rule" />

      {/* ── FINAL CTA ── */}
      <section style={{padding:"80px clamp(20px,5vw,56px)"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <h2 style={{
            fontFamily:"Bebas Neue",
            fontSize:"clamp(44px,8vw,88px)",
            letterSpacing:"0.02em",lineHeight:0.9,
            color:"#F0F0F8",marginBottom:28,maxWidth:700
          }}>
            Stop writing documents<br />
            <span style={{color:"#4FC3F7"}}>from scratch.</span>
          </h2>
          <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
            <button className="lp-btn-lg" onClick={onEnterGate}>
              Try the Studio Free
            </button>
            <span style={{fontSize:13,color:"#2A2A3A"}}>or</span>
            <button style={{
              background:"transparent",border:"none",
              color:"#4A4A6A",fontFamily:"DM Sans",fontWeight:500,
              fontSize:14,cursor:"pointer",padding:0,
              transition:"color 0.15s",textDecoration:"underline",
              textDecorationColor:"#2A2A3A"
            }} onClick={onBuy}>Purchase for $29 →</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop:"1px solid #0D0D1C",
        padding:"28px clamp(20px,5vw,56px)",
        display:"flex",alignItems:"center",
        justifyContent:"space-between",flexWrap:"wrap",gap:12
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:22,height:22,borderRadius:"50%",border:"1.5px solid #4FC3F7",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:7,height:7,background:"#FFB347",borderRadius:"50%"}} />
          </div>
          <span style={{fontFamily:"Bebas Neue",fontSize:16,letterSpacing:"0.14em",color:"#F0F0F8"}}>CINEFY</span>
        </div>
        <span style={{fontSize:12,color:"#1E1E2E"}}>cinefypro.co · Stop Starting From Scratch.</span>
        <span style={{fontSize:11,color:"#141420"}}>© 2026 Cinefy</span>
      </footer>
    </div>
  );
}

// ── ACCESS GATE ───────────────────────────────────────────
function AccessGate({ onUnlock, onBack }) {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [checking, setChecking] = useState(false);

  const VALID_CODES = ["CINEFY2026", "cinefy2026"];

  const handleSubmit = async () => {
    // Validate email first
    if (!email || !email.includes("@") || !email.includes(".")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (!code.trim()) {
      setError("Please enter your access code.");
      return;
    }
    setChecking(true);
    setError(""); setEmailError("");

    const isValid = VALID_CODES.includes(code.trim().toUpperCase()) ||
                    VALID_CODES.includes(code.trim());
    if (!isValid) {
      setError("Invalid access code. Check your Gumroad receipt and try again.");
      setChecking(false);
      return;
    }

    // Submit email to Formspree before unlocking
    try {
      await fetch("https://formspree.io/f/xjgazdvz", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          email,
          source: "Cinefy Studio Access — Code Redemption",
          code: code.trim().toUpperCase(),
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (_) {
      // Silently continue even if Formspree fails — don't block access
    }
    onUnlock();
  };

  return (
    <div style={{
      background:"#07070D", minHeight:"100vh",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      fontFamily:"'DM Sans', sans-serif", color:"#F0F0F8",
      padding:"24px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        .gate-input {
          background: #0A0A16; border: 1px solid #1A1A32;
          color: #F0F0F8; font-family: DM Sans; font-size: 18px;
          letter-spacing: 0.12em; text-align: center; font-weight: 600;
          width: 100%; padding: 18px 24px; border-radius: 8px;
          outline: none; transition: border-color 0.15s;
          text-transform: uppercase;
        }
        .gate-input:focus { border-color: #4FC3F7; }
        .gate-input::placeholder { color: #252540; letter-spacing: 0.08em; font-weight: 400; text-transform: none; }
        .gate-btn {
          width: 100%; background: #4FC3F7; color: #07070D;
          font-family: DM Sans; font-weight: 700; font-size: 16px;
          padding: 16px; border: none; border-radius: 8px;
          cursor: pointer; transition: background 0.15s, opacity 0.15s;
          letter-spacing: 0.02em;
        }
        .gate-btn:hover { background: #7DD4F8; }
        .gate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* Logo */}
      <div style={{
        width:48, height:48, borderRadius:"50%",
        border:"2px solid #4FC3F7",
        display:"flex", alignItems:"center", justifyContent:"center",
        marginBottom:20
      }}>
        <div style={{width:16, height:16, borderRadius:"50%", background:"#FFB347"}} />
      </div>

      <div style={{
        width:"100%", maxWidth:420,
        background:"#0A0A16", border:"1px solid #1A1A32",
        borderRadius:12, padding:"40px 36px"
      }}>
        <div style={{textAlign:"center", marginBottom:32}}>
          <h1 style={{fontFamily:"Bebas Neue", fontSize:32, letterSpacing:"0.06em", marginBottom:8}}>
            Unlock Your Studio
          </h1>
          <p style={{fontSize:15, color:"#7A7A9A", lineHeight:1.6}}>
            Enter your email and the access code from your Gumroad receipt to unlock all 30 prompts.
          </p>
        </div>

        <div style={{display:"flex", flexDirection:"column", gap:12}}>

          {/* Email field — required */}
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,letterSpacing:"0.08em",color:"#7A7A9A",marginBottom:7}}>
              YOUR EMAIL <span style={{color:"#FF6B6B"}}>*</span>
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{
                background:"#040408", border:`1px solid ${emailError ? "#FF6B6B" : "#1A1A32"}`,
                color:"#F0F0F8", fontFamily:"DM Sans", fontSize:16,
                width:"100%", padding:"14px 18px", borderRadius:8,
                outline:"none", transition:"border-color 0.15s",
              }}
            />
            {emailError && (
              <p style={{fontSize:12,color:"#FF6B6B",marginTop:5}}>{emailError}</p>
            )}
          </div>

          {/* Access code field */}
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,letterSpacing:"0.08em",color:"#7A7A9A",marginBottom:7}}>
              ACCESS CODE <span style={{color:"#FF6B6B"}}>*</span>
            </label>
            <input
              className="gate-input"
              placeholder="Enter your code"
              value={code}
              onChange={e => { setCode(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {error && (
            <p style={{
              fontSize:13, color:"#FF6B6B", textAlign:"center",
              background:"rgba(255,107,107,0.06)", border:"1px solid rgba(255,107,107,0.2)",
              borderRadius:6, padding:"10px 16px"
            }}>{error}</p>
          )}

          <button className="gate-btn" onClick={handleSubmit}
            disabled={!code.trim() || !email.trim() || checking}>
            {checking ? "Verifying..." : "Unlock Studio"}
          </button>

          <p style={{fontSize:11,color:"#3A3A5A",textAlign:"center"}}>
            Your email is used to save your access and receive Cinefy updates. No spam.
          </p>
        </div>

        <div style={{
          marginTop:28, paddingTop:24,
          borderTop:"1px solid #111120",
          textAlign:"center"
        }}>
          <p style={{fontSize:13, color:"#6060808", marginBottom:12}}>
            Don't have a code yet?
          </p>
          <button
            onClick={() => window.open("https://cinefy.gumroad.com/l/mapzvs", "_blank")}
            style={{
              background:"transparent", border:"1px solid #FFB347",
              color:"#FFB347", fontFamily:"DM Sans", fontWeight:700,
              fontSize:14, padding:"10px 24px", borderRadius:6,
              cursor:"pointer", width:"100%"
            }}
          >
            Get Access — $29
          </button>
        </div>
      </div>

      <button
        onClick={onBack}
        style={{
          marginTop:20, background:"transparent", border:"none",
          color:"#6060808", fontFamily:"DM Sans", fontSize:14,
          cursor:"pointer"
        }}
      >
        ← Back to landing page
      </button>
    </div>
  );
}



// ── PDF EXPORT UTILITIES ──────────────────────────────────
const loadJsPDF = () => new Promise((resolve, reject) => {
  if (window.jspdf?.jsPDF) { resolve(window.jspdf.jsPDF); return; }
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  s.onload  = () => resolve(window.jspdf.jsPDF);
  s.onerror = reject;
  document.head.appendChild(s);
});

const C = {
  black:[7,7,13],deep:[13,13,26],panel:[17,17,32],border:[30,30,53],
  blue:[79,195,247],amber:[255,179,71],green:[91,224,106],
  white:[240,240,248],muted:[90,90,122],lgrey:[144,144,176],
};
const PW=210,PH=297,ML=16,IW=178;
const sf=(doc,rgb)=>doc.setFillColor(rgb[0],rgb[1],rgb[2]);
const sd=(doc,rgb)=>doc.setDrawColor(rgb[0],rgb[1],rgb[2]);
const st=(doc,rgb)=>doc.setTextColor(rgb[0],rgb[1],rgb[2]);
function bgPDF(doc){sf(doc,C.black);doc.rect(0,0,PW,PH,'F');}
function pdfHead(doc,title,sub,pg){
  sf(doc,C.deep);doc.rect(0,0,PW,22,'F');
  sf(doc,C.blue);doc.rect(0,22,PW,0.8,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(11);st(doc,C.white);doc.text('CINEFY',ML,14);
  doc.setFont('helvetica','normal');doc.setFontSize(7);st(doc,C.muted);doc.text('CINEFYPRO.CO',PW-ML,14,{align:'right'});
  sf(doc,C.panel);doc.rect(0,22.8,PW,20,'F');
  sd(doc,C.border);doc.setLineWidth(0.3);doc.line(0,42.8,PW,42.8);
  doc.setFont('helvetica','bold');doc.setFontSize(16);st(doc,C.white);doc.text(title.toUpperCase(),ML,34);
  if(sub){doc.setFont('helvetica','normal');doc.setFontSize(7.5);st(doc,C.muted);doc.text(sub,ML,40);}
  return 52;
}
function pdfFooter(doc){
  sf(doc,C.deep);doc.rect(0,PH-10,PW,10,'F');
  sf(doc,C.blue);doc.rect(0,PH-10,PW,0.6,'F');
  doc.setFont('helvetica','normal');doc.setFontSize(6.5);st(doc,C.muted);
  doc.text("CINEFY · THE FILMMAKER'S AI BIBLE · CINEFYPRO.CO",PW/2,PH-4,{align:'center'});
}
function pdfSection(doc,num,title,y){
  doc.setFont('courier','bold');doc.setFontSize(7.5);st(doc,C.amber);doc.text(num,ML,y);
  doc.setFont('helvetica','bold');doc.setFontSize(11);st(doc,C.white);doc.text(title.toUpperCase(),ML+10,y);
  sd(doc,C.border);doc.setLineWidth(0.4);
  const rx=ML+10+doc.getTextWidth(title.toUpperCase())+4;
  doc.line(rx,y-1,PW-ML,y-1);
  return y+9;
}
function pdfTwoFields(doc,l1,v1,l2,v2,y){
  const cw=IW/2-3,c2x=ML+cw+6;
  doc.setFont('helvetica','bold');doc.setFontSize(7.5);st(doc,C.muted);
  doc.text(l1.toUpperCase(),ML,y);doc.text(l2.toUpperCase(),c2x,y);
  const a=doc.splitTextToSize(v1||'—',cw-8),b=doc.splitTextToSize(v2||'—',cw-8);
  const bh=Math.max(10,Math.max(a.length,b.length)*5+6);
  sf(doc,C.panel);sd(doc,C.border);doc.setLineWidth(0.3);
  doc.roundedRect(ML,y+2,cw,bh,1.5,1.5,'FD');doc.roundedRect(c2x,y+2,cw,bh,1.5,1.5,'FD');
  doc.setFont('helvetica','normal');doc.setFontSize(9);st(doc,C.white);
  doc.text(a,ML+4,y+7);doc.text(b,c2x+4,y+7);
  return y+bh+6;
}
function pdfField(doc,label,value,y){
  const lines=doc.splitTextToSize(value||'—',IW-8);
  const h=Math.max(10,lines.length*5+6);
  doc.setFont('helvetica','bold');doc.setFontSize(7.5);st(doc,C.muted);doc.text(label.toUpperCase(),ML,y);
  sf(doc,C.panel);sd(doc,C.border);doc.setLineWidth(0.3);doc.roundedRect(ML,y+2,IW,h,1.5,1.5,'FD');
  doc.setFont('helvetica','normal');doc.setFontSize(9);st(doc,C.white);doc.text(lines,ML+4,y+7);
  return y+h+6;
}
function pdfShotRow(doc,num,type,desc,dur,y,even){
  const rh=8;
  sf(doc,even?C.panel:C.deep);sd(doc,C.border);doc.setLineWidth(0.2);doc.rect(ML,y,IW,rh,'FD');
  doc.setFont('courier','bold');doc.setFontSize(8);st(doc,C.blue);doc.text(String(num).padStart(3,'0'),ML+2,y+5.5);
  doc.setFont('courier','normal');doc.setFontSize(7.5);st(doc,C.amber);doc.text(type,ML+16,y+5.5);
  const dl=doc.splitTextToSize(desc,IW-38);
  doc.setFont('helvetica','normal');doc.setFontSize(8);st(doc,C.lgrey);doc.text(dl[0]||'',ML+32,y+5.5);
  doc.setFont('courier','normal');doc.setFontSize(7.5);st(doc,C.muted);doc.text(dur,PW-ML-2,y+5.5,{align:'right'});
  return y+rh;
}
function pdfCTA(doc,y){
  sf(doc,C.deep);sd(doc,C.blue);doc.setLineWidth(0.5);doc.roundedRect(ML,y,IW,26,2,2,'FD');
  doc.setFont('helvetica','bold');doc.setFontSize(14);st(doc,C.white);doc.text('Stop Starting From Scratch.',PW/2,y+9,{align:'center'});
  doc.setFont('courier','bold');doc.setFontSize(9);st(doc,C.amber);doc.text('CINEFYPRO.CO',PW/2,y+20,{align:'center'});
}

async function exportShotListPDF(fields) {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({unit:'mm',format:'a4'});
  bgPDF(doc);
  const pt=fields.PROJECT_TYPE||'Untitled Project',dir=fields.CREATIVE_DIRECTION||'',
        loc=fields.LOCATION||'',sub=fields.SUBJECT||'',cnt=parseInt(fields.SHOT_COUNT)||10,
        date=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  let y=pdfHead(doc,'Shot List',`${pt}  ·  ${date}`,1);
  y=pdfTwoFields(doc,'Project Type',pt,'Total Shots',String(cnt),y);
  y=pdfTwoFields(doc,'Location',loc,'Primary Subject',sub,y);
  if(dir){y=pdfSection(doc,'01','Creative Direction',y+2);y=pdfField(doc,'Visual Direction',dir,y);}
  y=pdfSection(doc,'02','Shot List',y+2);
  // Table header
  sf(doc,C.deep);doc.rect(ML,y,IW,7,'F');
  doc.setFont('courier','bold');doc.setFontSize(7);st(doc,C.blue);
  [['SHOT',0],['TYPE',14],['DESCRIPTION',30],['DUR',IW-18]].forEach(([h,x])=>doc.text(h,ML+x+2,y+4.8));
  y+=7;
  const types=['ECU','CU','MCU','MS','WS','OTS','POV','INSERT','2-SHOT','STEADICAM'],
        descs=['Hero shot. Hold until the scene establishes itself. No movement.','Slow push in — motivated by the emotional beat. Rack focus at mark.','B-roll coverage. Available light only.','Establishing wide. Lock off. Let the environment speak.','Reaction shot. Hold two beats longer than comfortable.','Insert. Extreme shallow depth. Subject implied, not shown.','Over-shoulder. Camera breathes — not performing.','POV. Handheld with intention. Not shaky — present.','Two-shot. Equal weight in frame.','Closing image. The last frame the viewer carries out.'],
        durs=['4s','3s','5s','6s','2s','4s','3s','3s','5s','8s'];
  for(let i=0;i<Math.min(cnt,15);i++){
    if(y>PH-24){pdfFooter(doc);doc.addPage();bgPDF(doc);y=pdfHead(doc,'Shot List (cont.)',pt,2);
      sf(doc,C.deep);doc.rect(ML,y,IW,7,'F');doc.setFont('courier','bold');doc.setFontSize(7);st(doc,C.blue);
      [['SHOT',0],['TYPE',14],['DESCRIPTION',30],['DUR',IW-18]].forEach(([h,x])=>doc.text(h,ML+x+2,y+4.8));y+=7;}
    y=pdfShotRow(doc,i+1,types[i%types.length],descs[i%descs.length],durs[i%durs.length],y,i%2===0);
  }
  if(y<PH-36){y+=6;y=pdfSection(doc,'03','Production Notes',y);
    sf(doc,C.panel);sd(doc,C.border);doc.setLineWidth(0.3);doc.roundedRect(ML,y,IW,22,2,2,'FD');
    sf(doc,C.amber);doc.rect(ML,y,2.5,22,'F');
    doc.setFont('helvetica','italic');doc.setFontSize(8.5);st(doc,C.muted);
    doc.text('Add production notes, crew requirements, or special equipment here.',ML+5,y+8);}
  pdfFooter(doc);
  doc.save(`cinefy-shot-list-${pt.toLowerCase().replace(/\s+/g,'-').slice(0,30)}.pdf`);
}

async function exportCampaignPDF(fields) {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({unit:'mm',format:'a4'});
  bgPDF(doc);
  const brand=fields.BRAND||'Brand Name',product=fields.PRODUCT||'',
        audience=fields.AUDIENCE||'',duration=fields.DURATION||'60s',
        emotion=fields.EMOTION||'',visual=fields.VISUAL_STYLE||'',
        date=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  let y=pdfHead(doc,'Ad Campaign Brief',`${brand}  ·  ${date}`,1);
  y=pdfTwoFields(doc,'Brand / Client',brand,'Ad Duration',duration,y);
  y=pdfTwoFields(doc,'Product / Launch',product,'Target Audience',audience,y);
  y+=2;y=pdfSection(doc,'01','Campaign Concept',y);
  y=pdfField(doc,'Emotional Core',emotion||'The emotional truth this ad must leave the viewer feeling.',y);
  y+=2;y=pdfSection(doc,'02','Visual Direction',y);
  y=pdfField(doc,'Cinematography & Style',visual||'Visual and cinematic direction.',y);
  y+=2;y=pdfSection(doc,'03','Scene Breakdown',y);
  const scenes=[
    [1,'0:00–0:08','The Hook','Open on the problem. No brand. No product. The first frame must earn the next.','Ambient sound only — no music.','No voiceover. Let the image work.'],
    [2,'0:08–0:20','The Tension','Build the problem. The viewer recognises themselves.','Music enters low — unresolved.','You know this feeling.'],
    [3,'0:20–0:38','The Turn','Product enters frame. Music resolves. Something shifts.','Single piano note then strings.','There is a better way.'],
    [4,'0:38–0:52','The Proof','Show the outcome. Not features — transformation.','Full cinematic score.','This is what changes.'],
    [5,'0:52–1:00','The Close','Cut to brand. Logo. URL. Hold. Silence.','Single resonant note. Silence.','Stop starting from scratch.'],
  ];
  for(const [num,timing,heading,vis,aud,vo] of scenes){
    if(y>PH-32){pdfFooter(doc);doc.addPage();bgPDF(doc);y=pdfHead(doc,'Campaign Brief (cont.)',brand,2);}
    const lw=18,rw=IW-lw-3;
    const vl=doc.splitTextToSize('VISUAL: '+vis,rw-4),al=doc.splitTextToSize('AUDIO: '+aud,rw-4),vol=doc.splitTextToSize('VO: '+vo,rw-4);
    const ch=Math.max((vl.length+al.length+vol.length)*4.8+18,28);
    sf(doc,C.deep);sd(doc,C.border);doc.setLineWidth(0.3);doc.roundedRect(ML,y,lw,ch,2,0,'FD');
    doc.setFont('helvetica','bold');doc.setFontSize(18);st(doc,C.border);doc.text(String(num).padStart(2,'0'),ML+2,y+12);
    doc.setFont('courier','normal');doc.setFontSize(6);st(doc,C.amber);doc.text(timing,ML+2,y+ch-5);
    sf(doc,C.panel);doc.roundedRect(ML+lw+1,y,rw,ch,0,2,'FD');
    const rx=ML+lw+4;let ry=y+7;
    doc.setFont('helvetica','bold');doc.setFontSize(9.5);st(doc,C.white);doc.text(heading,rx,ry);ry+=7;
    [[vl,C.lgrey],[al,C.muted],[vol,C.blue]].forEach(([lines,col])=>{
      if(!lines.length)return;doc.setFont('helvetica','normal');doc.setFontSize(8.5);st(doc,col);doc.text(lines,rx,ry);ry+=lines.length*4.8+3;
    });
    y+=ch+3;
  }
  if(y<PH-30)pdfCTA(doc,y+8);
  pdfFooter(doc);
  doc.save(`cinefy-campaign-${brand.toLowerCase().replace(/\s+/g,'-').slice(0,30)}.pdf`);
}

const PDF_PROMPTS = { '002': exportShotListPDF, '031': exportCampaignPDF };


// ── PROMPT STUDIO ─────────────────────────────────────────
function Studio({ onBack, onDemo }) {
  const [activeCat, setActiveCat] = useState("All");
  const [selected, setSelected] = useState(PROMPTS[0]);
  const [fieldVals, setFieldVals] = useState({});
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [editedPrompt, setEditedPrompt] = useState(null);
  const [studioEmail, setStudioEmail] = useState("");
  const [studioEmailSent, setStudioEmailSent] = useState(false);
  const [studioEmailSaving, setStudioEmailSaving] = useState(false);
  const outputRef = useRef(null);

  const allCats = ["All", ...CATS];

  const filtered = PROMPTS.filter(p => p && p.id).filter(p => {
    const matchCat = activeCat === "All" || p.cat === activeCat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const selectPrompt = (p) => {
    setSelected(p);
    setFieldVals({});
    setCopied(false);
    setEditedPrompt(null);
  };

  const currentVals = { ...((selected.vars || []).reduce((a,v) => ({...a,[v.k]:""}),{})), ...fieldVals };
  const generatedPrompt = fillPrompt(selected.prompt, currentVals);
  const finalPrompt = editedPrompt !== null ? editedPrompt : generatedPrompt;

  const copyPrompt = () => {
    navigator.clipboard.writeText(finalPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const chCol = CH_COLOR[selected.ch] || COLORS.blue;

  const submitStudioEmail = async () => {
    if (!studioEmail || !studioEmail.includes("@")) return;
    setStudioEmailSaving(true);
    try {
      await fetch("https://formspree.io/f/xjgazdvz", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          email: studioEmail,
          source: `Cinefy Studio — Prompt ${selected.id} — ${selected.name}`,
          timestamp: new Date().toISOString(),
        }),
      });
      setStudioEmailSent(true);
    } catch (_) { setStudioEmailSent(true); }
    setStudioEmailSaving(false);
  };

  return (
    <div style={{background:"#07070D", minHeight:"100vh", fontFamily:"'DM Sans', sans-serif", color:"#F0F0F8", display:"flex", flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #07070D; }
        ::-webkit-scrollbar-thumb { background: #1E1E2E; border-radius: 4px; }

        /* ── Sidebar prompt rows ── */
        .p-row {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 16px; cursor: pointer;
          border-radius: 6px; margin: 1px 8px;
          transition: background 0.12s;
          border: none; background: transparent;
          width: calc(100% - 16px); text-align: left;
        }
        .p-row:hover { background: rgba(255,255,255,0.04); }
        .p-row.active { background: rgba(79,195,247,0.08); }

        /* ── Category tabs ── */
        .cat-tab {
          background: transparent; border: none;
          color: #6060808; padding: 6px 14px; border-radius: 20px;
          cursor: pointer; font-size: 12px; font-weight: 600;
          letter-spacing: 0.04em; white-space: nowrap;
          transition: all 0.12s; font-family: DM Sans;
        }
        .cat-tab:hover { color: #F0F0F8; background: rgba(255,255,255,0.05); }
        .cat-tab.active { color: #4FC3F7; background: rgba(79,195,247,0.08); }

        /* ── Search ── */
        .s-input {
          background: rgba(255,255,255,0.04); border: 1px solid #1A1A2E;
          color: #F0F0F8; font-family: DM Sans; font-size: 14px;
          width: 100%; padding: 9px 14px 9px 36px; border-radius: 8px;
          outline: none; transition: border-color 0.15s;
        }
        .s-input:focus { border-color: #4FC3F7; background: rgba(255,255,255,0.06); }
        .s-input::placeholder { color: #3A3A5A; }

        /* ── Field inputs ── */
        .f-input {
          background: rgba(255,255,255,0.03); border: 1px solid #1A1A2E;
          color: #F0F0F8; font-family: DM Sans; font-size: 14px;
          width: 100%; padding: 12px 14px; border-radius: 8px;
          outline: none; resize: vertical; transition: border-color 0.15s;
          line-height: 1.6;
        }
        .f-input:focus { border-color: #4FC3F7; background: rgba(255,255,255,0.05); }
        .f-input::placeholder { color: #2A2A3A; }

        /* ── Output box ── */
        .out-box {
          background: rgba(255,255,255,0.02); border: 1px solid #1A1A2E;
          border-radius: 10px; padding: 20px 22px;
          font-family: DM Sans; font-size: 14px; color: #C8C0B0;
          line-height: 1.85; white-space: pre-wrap; word-break: break-word;
          min-height: 200px; width: 100%; resize: vertical; cursor: text;
          transition: border-color 0.15s;
        }
        .out-box:focus { border-color: #2A2A3E; outline: none; }

        /* ── Buttons ── */
        .btn-copy {
          background: #4FC3F7; color: #07070D;
          border: none; padding: 10px 22px; border-radius: 8px;
          cursor: pointer; font-size: 14px; font-weight: 700;
          font-family: DM Sans; transition: background 0.15s, transform 0.1s;
          letter-spacing: 0.01em;
        }
        .btn-copy:hover { background: #7DD4F8; transform: translateY(-1px); }
        .btn-copy.copied { background: rgba(91,224,106,0.12); color: #5BE06A; border: 1px solid rgba(91,224,106,0.3); }

        .btn-outline {
          background: transparent; border: 1px solid #1A1A2E;
          color: #9090B0; padding: 10px 18px; border-radius: 8px;
          cursor: pointer; font-size: 14px; font-weight: 500;
          font-family: DM Sans; transition: all 0.15s;
          display: flex; align-items: center; gap: 7px;
        }
        .btn-outline:hover { border-color: #2A2A4E; color: #F0F0F8; }
        .btn-outline.amber { border-color: rgba(255,179,71,0.3); color: #FFB347; }
        .btn-outline.amber:hover { border-color: #FFB347; background: rgba(255,179,71,0.06); }

        /* ── Section label ── */
        .sec-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          color: #3A3A5A; text-transform: uppercase; margin-bottom: 12px;
          display: block;
        }

        /* ── Divider ── */
        .div-line { height: 1px; background: #0F0F1E; margin: 28px 0; }

        /* ── Layout ── */
        .sidebar {
          width: 280px; min-width: 280px; background: #060610;
          border-right: 1px solid #0F0F1E; overflow-y: auto;
          display: flex; flex-direction: column; height: calc(100vh - 56px);
        }
        .main-panel { flex: 1; overflow-y: auto; height: calc(100vh - 56px); }

        @media (max-width: 768px) {
          .studio-layout { flex-direction: column !important; }
          .sidebar { width: 100% !important; min-width: unset !important; height: auto !important; border-right: none !important; border-bottom: 1px solid #0F0F1E; max-height: 45vh; }
          .main-panel { height: auto !important; }
        }
      `}</style>

      {/* ── TOP NAV ── */}
      <div style={{
        height:56, background:"#060610",
        borderBottom:"1px solid #0F0F1E",
        display:"flex", alignItems:"center",
        justifyContent:"space-between",
        padding:"0 20px", flexShrink:0
      }}>
        {/* Left — logo + breadcrumb */}
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{
            width:28, height:28, borderRadius:"50%",
            border:"1.5px solid #4FC3F7",
            display:"flex", alignItems:"center", justifyContent:"center"
          }}>
            <div style={{width:9, height:9, background:"#FFB347", borderRadius:"50%"}} />
          </div>
          <span style={{fontFamily:"Bebas Neue", fontSize:18, letterSpacing:"0.14em", color:"#F0F0F8"}}>CINEFY</span>
          <span style={{color:"#1E1E2E", fontSize:16, margin:"0 2px"}}>/</span>
          <span style={{fontSize:13, color:"#5A5A7A", fontWeight:500}}>Prompt Studio</span>
        </div>

        {/* Center — prompt counter */}
        <span style={{fontSize:12, color:"#3A3A5A", fontWeight:600, letterSpacing:"0.06em"}}>
          {selected.id} / 30
        </span>

        {/* Right — actions */}
        <div style={{display:"flex", gap:8}}>
          <button onClick={onDemo} style={{
            background:"transparent", border:"1px solid #1A1A2E",
            color:"#7070808", padding:"6px 14px", borderRadius:6,
            cursor:"pointer", fontSize:12, fontFamily:"DM Sans",
            fontWeight:600, letterSpacing:"0.04em", transition:"all 0.15s"
          }}>Demo</button>
          <button onClick={onBack} style={{
            background:"transparent", border:"1px solid #1A1A2E",
            color:"#5A5A7A", padding:"6px 14px", borderRadius:6,
            cursor:"pointer", fontSize:12, fontFamily:"DM Sans", transition:"all 0.15s"
          }}>← Exit</button>
        </div>
      </div>

      <div className="studio-layout" style={{display:"flex", flex:1, overflow:"hidden"}}>

        {/* ── SIDEBAR ── */}
        <div className="sidebar">

          {/* Search */}
          <div style={{padding:"14px 12px 10px", position:"relative"}}>
            <svg style={{position:"absolute", left:22, top:"50%", transform:"translateY(-50%)", pointerEvents:"none"}}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3A3A5A" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input className="s-input" placeholder="Search prompts..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Category tabs */}
          <div style={{padding:"0 4px 10px", display:"flex", flexWrap:"wrap", gap:4}}>
            {allCats.map(cat => {
              const label = cat === "All" ? "All" : (cat || "").split(" ")[0];
              return (
                <button key={cat} className={`cat-tab${activeCat===cat?" active":""}`}
                  onClick={() => setActiveCat(cat)} title={cat}>
                  {label}
                </button>
              );
            })}
          </div>

          {/* Count */}
          <div style={{padding:"0 16px 8px", fontSize:11, color:"#2A2A3A", fontWeight:700, letterSpacing:"0.08em"}}>
            {filtered.length} PROMPT{filtered.length!==1?"S":""}
          </div>

          {/* Prompt list */}
          <div style={{padding:"0 0 20px", display:"flex", flexDirection:"column"}}>
            {filtered.map(p => {
              const col = CH_COLOR[p.ch];
              const isActive = selected.id === p.id;
              return (
                <button key={p.id} className={`p-row${isActive?" active":""}`}
                  onClick={() => selectPrompt(p)}>
                  <div style={{
                    width:3, height:28, borderRadius:2,
                    background: isActive ? col : "transparent",
                    flexShrink:0, transition:"background 0.15s"
                  }} />
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{
                      fontSize:13, fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#F0F0F8" : "#8080A0",
                      lineHeight:1.3, transition:"color 0.12s",
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"
                    }}>{p.name}</div>
                    <div style={{fontSize:11, color:"#3A3A5A", marginTop:2}}>{CH_NAMES[p.ch]}</div>
                  </div>
                  {PDF_PROMPTS[p.id] && (
                    <div style={{
                      fontSize:9, fontWeight:700, letterSpacing:"0.06em",
                      color:"#FFB347", flexShrink:0
                    }}>PDF</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MAIN PANEL ── */}
        <div className="main-panel">
          <div style={{padding:"32px 36px", maxWidth:820}}>

            {/* Prompt header */}
            <div style={{marginBottom:32}}>
              <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:12}}>
                <div style={{
                  width:6, height:6, borderRadius:"50%",
                  background:chCol, flexShrink:0
                }} />
                <span style={{fontSize:11, fontWeight:700, color:"#3A3A5A", letterSpacing:"0.1em"}}>
                  {selected.cat.toUpperCase()}
                </span>
                <span style={{fontSize:11, color:"#2A2A3A"}}>·</span>
                <span style={{fontSize:11, color:"#2A2A3A", letterSpacing:"0.06em"}}>PROMPT {selected.id}</span>
              </div>
              <h1 style={{
                fontFamily:"Bebas Neue", fontSize:38,
                letterSpacing:"0.04em", color:"#F0F0F8",
                lineHeight:1, marginBottom:10
              }}>{selected.name}</h1>
              <p style={{fontSize:15, color:"#7070908", lineHeight:1.65, maxWidth:600}}>{selected.desc}</p>
            </div>

            <div className="div-line" />

            {/* Variable inputs */}
            {(selected.vars || []).length > 0 && (
              <div style={{marginBottom:32}}>
                <span className="sec-label">Customise your prompt</span>
                <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px,1fr))", gap:16}}>
                  {(selected.vars || []).map(v => (
                    <div key={v.k}>
                      <label style={{
                        display:"block", fontSize:11, fontWeight:600,
                        color:"#4A4A6A", letterSpacing:"0.06em", marginBottom:7
                      }}>
                        {v.l}
                      </label>
                      <textarea className="f-input"
                        rows={(v.ph || "").length > 60 ? 3 : 2}
                        placeholder={v.ph}
                        value={fieldVals[v.k] || ""}
                        onChange={e => { setFieldVals(prev => ({...prev, [v.k]: e.target.value})); setEditedPrompt(null); }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="div-line" />

            {/* Output section */}
            <div>
              {/* Optional email capture */}
              {!studioEmailSent ? (
                <div style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"12px 16px", marginBottom:20,
                  background:"rgba(255,255,255,0.02)",
                  border:"1px solid #0F0F1E", borderRadius:8,
                  flexWrap:"wrap"
                }}>
                  <p style={{fontSize:12, color:"#4A4A6A", flex:1, minWidth:180, margin:0}}>
                    Enter your email to save your work and get updates from CINEFY
                  </p>
                  <div style={{display:"flex", gap:8, flexShrink:0}}>
                    <input type="email" placeholder="your@email.com"
                      value={studioEmail} onChange={e => setStudioEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && submitStudioEmail()}
                      style={{
                        background:"rgba(255,255,255,0.04)", border:"1px solid #1A1A2E",
                        color:"#F0F0F8", fontFamily:"DM Sans", fontSize:13,
                        padding:"8px 14px", borderRadius:6, outline:"none", width:190
                      }}
                    />
                    <button onClick={submitStudioEmail}
                      disabled={!studioEmail.trim() || studioEmailSaving}
                      style={{
                        background:"#4FC3F7", color:"#07070D", fontFamily:"DM Sans",
                        fontWeight:700, fontSize:13, padding:"8px 16px",
                        borderRadius:6, border:"none", cursor:"pointer",
                        opacity:(!studioEmail.trim() || studioEmailSaving) ? 0.4 : 1
                      }}>{studioEmailSaving ? "..." : "Save"}</button>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding:"10px 16px", marginBottom:20,
                  background:"rgba(91,224,106,0.03)",
                  border:"1px solid rgba(91,224,106,0.15)", borderRadius:8,
                  display:"flex", alignItems:"center", gap:10
                }}>
                  <div style={{width:5, height:5, borderRadius:"50%", background:"#5BE06A", flexShrink:0}} />
                  <p style={{fontSize:12, color:"#5BE06A", margin:0}}>You're on the list.</p>
                </div>
              )}

              {/* Output label + actions */}
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:10}}>
                <span className="sec-label" style={{margin:0}}>Your prompt</span>
                <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                  <button className={`btn-copy${copied?" copied":""}`} onClick={copyPrompt}>
                    {copied ? "✓ Copied" : "Copy Prompt"}
                  </button>
                  {PDF_PROMPTS[selected.id] && (
                    <button className="btn-outline amber"
                      onClick={() => PDF_PROMPTS[selected.id](fieldVals)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download PDF
                    </button>
                  )}
                  <button className="btn-outline"
                    onClick={() => { setFieldVals({}); setEditedPrompt(null); }}>
                    Reset
                  </button>
                </div>
              </div>

              {/* Output textarea */}
              <textarea className="out-box" ref={outputRef}
                value={finalPrompt}
                onChange={e => setEditedPrompt(e.target.value)}
              />
              <p style={{fontSize:11, color:"#2A2A3A", marginTop:8, lineHeight:1.6}}>
                Click inside to edit any word before copying. Paste into ChatGPT, Claude, or Gemini.
              </p>

              {PDF_PROMPTS[selected.id] && (
                <div style={{
                  marginTop:16, padding:"12px 16px",
                  background:"rgba(255,179,71,0.03)",
                  border:"1px solid rgba(255,179,71,0.12)",
                  borderRadius:8, display:"flex", alignItems:"center", gap:12
                }}>
                  <div style={{width:5, height:5, borderRadius:"50%", background:"#FFB347", flexShrink:0}} />
                  <span style={{fontSize:12, color:"#7A7A9A"}}>
                    Client-ready PDF available — fill in your details above then click Download PDF.
                  </span>
                </div>
              )}
            </div>

            {/* Next / Previous */}
            <div style={{display:"flex", gap:10, marginTop:40, paddingTop:28, borderTop:"1px solid #0F0F1E"}}>
              {PROMPTS.find(p => p && parseInt(p.id) === parseInt(selected.id)-1) && (
                <button className="btn-outline"
                  onClick={() => selectPrompt(PROMPTS.find(p => p && parseInt(p.id) === parseInt(selected.id)-1))}>
                  ← Previous
                </button>
              )}
              {PROMPTS.find(p => p && parseInt(p.id) === parseInt(selected.id)+1) && (
                <button style={{
                  marginLeft:"auto", background:`${chCol}10`, border:`1px solid ${chCol}40`,
                  color:chCol, padding:"10px 20px", borderRadius:8,
                  cursor:"pointer", fontSize:14, fontFamily:"DM Sans", fontWeight:600,
                  transition:"all 0.15s"
                }}
                  onClick={() => selectPrompt(PROMPTS.find(p => p && parseInt(p.id) === parseInt(selected.id)+1))}>
                  Next →
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ── ROOT ──────────────────────────────────────────────────
// ── DEMO MODE ─────────────────────────────────────────────
const DEMO_PROMPTS = [
  {
    id: "007",
    ch: "02",
    col: "#4FC3F7",
    title: "The Camera Movement Sequence",
    category: "Cinematography",
    editKey: "SCENE",
    editLabel: "Describe the scene",
    editDefault: "A man receives a phone call that ends his marriage. He is in his kitchen. He hangs up and does not move for 30 seconds.",
    promptTemplate: (scene) => `You are a DP designing a camera movement sequence for this scene:

${scene}

For each move state:
— Starting frame and ending frame
— Type of movement and speed
— What motivates the move (always motivated, never stylistic)
— What the viewer feels during and after

Include at least one completely static shot and explain its function.`,
    output: `MOVE 01  |  0:00–0:20  |  LOCKED OFF  |  50mm
He answers the phone. We do not move.
The camera's stillness IS the setup.

MOVE 02  |  0:20–0:35  |  VERY SLOW DOLLY IN  |  85mm
Motivated by: the moment he stops speaking.
The move is attentive — the way a person leans
forward sensing something is wrong.
Viewer feels: dread that has not named itself.

MOVE 03  |  0:50–1:30  |  LOCKED OFF AGAIN  |  35mm
He is small in the frame. We do not move.
The stillness after movement is louder
than the movement was.`,
  },
  {
    id: "006",
    ch: "02",
    col: "#FFB347",
    title: "The Lighting Setup Designer",
    category: "Cinematography",
    editKey: "SCENE",
    editLabel: "Describe the scene",
    editDefault: "Interior interview. Female CEO, 45. Authoritative but warm. Modern corner office, two floor-to-ceiling windows facing north.",
    promptTemplate: (scene) => `You are a professional gaffer and DP designing a lighting setup for this scene:

${scene}

Emotional tone: Quietly powerful. Available-feeling light that is precisely controlled.
Equipment: Two ARRI SkyPanel S60s, two 4x4 bounce frames, one negative fill flag.

Design a complete setup:
1. Key light — position, quality, modifier, colour temp, and why.
2. Fill or negative fill — approach and ratio.
3. Background treatment — what it communicates.
4. Practical lights — in-scene sources.
5. One film reference this setup is inspired by.`,
    output: `KEY: S60-C camera-left, 45 degrees, 5600K, quarter
grid. 7ft high. Rembrandt triangle on camera-side
cheek. Ratio: 3:1.

NEGATIVE FILL: 4x4 black flag camera-right, 18
inches from subject. No fill. The shadow is the
authority.

BACKGROUND: Leave north window overexposed 1.5
stops. Reads as window, not a light source.

PRACTICAL: Desk lamp at 2700K, dimmed to 40%.
Eye light from below. Motivated. Invisible.

REFERENCE: Janusz Kaminski — Lincoln (2012).
The cabinet scenes.`,
  },
  {
    id: "013",
    ch: "03",
    col: "#B48EF7",
    title: "The Hero Shot Generator",
    category: "AI Video Tools",
    editKey: "PROJECT",
    editLabel: "Describe your project",
    editDefault: "Brand film for a luxury watchmaker celebrating 100 years of craft.",
    promptTemplate: (project) => `Generate a single hero shot for: ${project}

Subject: Male watchmaker, 70s, weathered hands, reading glasses pushed up on forehead. Holding a movement up to the light.

Expression communicates: The quiet satisfaction of mastery that has never needed an audience.

Framing: Medium close-up, subject left-third, negative space right — workshop receding into soft darkness.

Lighting: Single tungsten work lamp camera-right, no fill. Split lighting, ratio 8:1 minimum.

This frame must communicate: That some things are worth doing slowly, for their own sake, forever.`,
    output: `"Male watchmaker, 70s, left-third of frame.
Right hand raised — holding a movement up to
a single tungsten work lamp camera-right.

Split light. 8:1 ratio. The shadow side of his
face disappears completely.

85mm, T2.0. Workshop tools at f/2 — warm amber
blur. The only other sharp element: his reading
glasses pushed up on his forehead.

They have been pushed there a thousand times.
This is not performance.

This is what mastery looks like when it is not
performing for anyone."`,
  },
];

function DemoMode({ onBack }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [phase, setPhase] = useState("prompt"); // "prompt" | "output"
  const [editVal, setEditVal] = useState(DEMO_PROMPTS[0].editDefault);
  const [copied, setCopied] = useState(false);

  const demo = DEMO_PROMPTS[activeIdx];
  const finalPrompt = demo.promptTemplate(editVal);

  const switchPrompt = (idx) => {
    setActiveIdx(idx);
    setPhase("prompt");
    setEditVal(DEMO_PROMPTS[idx].editDefault);
    setCopied(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(finalPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      background:"#07070D", minHeight:"100vh",
      fontFamily:"'DM Sans', sans-serif", color:"#F0F0F8",
      display:"flex", flexDirection:"column"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #1A1A32; }

        .demo-tab {
          background: transparent;
          border: 1px solid #1A1A32;
          color: #9090B0;
          font-family: DM Sans; font-weight: 600;
          font-size: 13px; letter-spacing: 0.06em;
          padding: 10px 20px; border-radius: 6px;
          cursor: pointer; transition: all 0.15s;
          white-space: nowrap;
        }
        .demo-tab:hover { border-color: #2A2A48; color: #C0C0D8; }
        .demo-tab.active {
          background: rgba(79,195,247,0.08);
          border-color: #4FC3F7; color: #4FC3F7;
        }

        .phase-btn {
          flex: 1; padding: 14px;
          font-family: DM Sans; font-weight: 700;
          font-size: 14px; letter-spacing: 0.06em;
          border: none; cursor: pointer;
          transition: all 0.15s; border-radius: 6px;
        }

        .demo-edit {
          background: #040408;
          border: 1px solid #1A1A32;
          color: #F0F0F8;
          font-family: DM Sans; font-size: 18px;
          line-height: 1.7; width: 100%;
          border-radius: 8px; padding: 20px 24px;
          outline: none; resize: none;
          transition: border-color 0.15s;
        }
        .demo-edit:focus { border-color: #4FC3F7; }

        .copy-demo {
          background: #4FC3F7; color: #07070D;
          font-family: DM Sans; font-weight: 700;
          font-size: 16px; padding: 14px 32px;
          border: none; border-radius: 6px;
          cursor: pointer; transition: background 0.15s;
          letter-spacing: 0.02em;
        }
        .copy-demo:hover { background: #7DD4F8; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.25s ease both; }
      `}</style>

      {/* DEMO NAV */}
      <div style={{
        height:58, background:"#0A0A14",
        borderBottom:"1px solid #111120",
        display:"flex", alignItems:"center",
        justifyContent:"space-between",
        padding:"0 20px", flexShrink:0
      }}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{
            width:28, height:28, borderRadius:"50%",
            border:"1.5px solid #4FC3F7",
            display:"flex", alignItems:"center", justifyContent:"center"
          }}>
            <div style={{width:9, height:9, background:"#FFB347", borderRadius:"50%"}} />
          </div>
          <span style={{fontFamily:"Bebas Neue", fontSize:18, letterSpacing:"0.14em"}}>CINEFY</span>
          <div style={{
            fontSize:11, fontWeight:700, letterSpacing:"0.1em",
            color:"#B48EF7", background:"rgba(180,142,247,0.1)",
            border:"1px solid rgba(180,142,247,0.2)",
            padding:"3px 10px", borderRadius:4, marginLeft:6
          }}>DEMO MODE</div>
        </div>
        <button onClick={onBack} style={{
          background:"transparent", border:"1px solid #1A1A32",
          color:"#5A5A7A", padding:"7px 16px", borderRadius:6,
          cursor:"pointer", fontSize:13, fontFamily:"DM Sans"
        }}>Exit Demo</button>
      </div>

      <div style={{flex:1, display:"flex", flexDirection:"column", padding:"clamp(20px,4vw,40px)", gap:24, maxWidth:900, margin:"0 auto", width:"100%"}}>

        {/* PROMPT SELECTOR TABS */}
        <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
          {DEMO_PROMPTS.map((d, i) => (
            <button
              key={d.id}
              className={`demo-tab${activeIdx===i?" active":""}`}
              style={activeIdx===i ? {borderColor:d.col, color:d.col, background:`${d.col}0D`} : {}}
              onClick={() => switchPrompt(i)}
            >
              {d.id} · {d.title}
            </button>
          ))}
        </div>

        {/* PROMPT HEADER */}
        <div className="fade-in" key={`header-${activeIdx}`}>
          <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:10}}>
            <div style={{
              fontSize:11, fontWeight:700, letterSpacing:"0.1em",
              color:demo.col, background:`${demo.col}12`,
              padding:"4px 12px", borderRadius:4
            }}>PROMPT {demo.id}</div>
            <span style={{fontSize:13, color:"#6060808", letterSpacing:"0.06em", fontWeight:600}}>
              {demo.category.toUpperCase()}
            </span>
          </div>
          <h1 style={{
            fontFamily:"Bebas Neue",
            fontSize:"clamp(36px, 7vw, 64px)",
            letterSpacing:"0.03em", lineHeight:0.92,
            color:"#F0F0F8"
          }}>{demo.title}</h1>
        </div>

        {/* PHASE TOGGLE */}
        <div style={{display:"flex", gap:8, background:"#0A0A14", padding:6, borderRadius:8, border:"1px solid #111120"}}>
          <button
            className="phase-btn"
            style={{
              background: phase==="prompt" ? demo.col : "transparent",
              color: phase==="prompt" ? "#07070D" : "#5A5A7A",
            }}
            onClick={() => setPhase("prompt")}
          >PROMPT</button>
          <button
            className="phase-btn"
            style={{
              background: phase==="output" ? "#5BE06A" : "transparent",
              color: phase==="output" ? "#07070D" : "#5A5A7A",
            }}
            onClick={() => setPhase("output")}
          >OUTPUT EXAMPLE</button>
        </div>

        {/* PROMPT PHASE */}
        {phase === "prompt" && (
          <div className="fade-in" style={{display:"flex", flexDirection:"column", gap:20}}>

            {/* EDITABLE FIELD */}
            <div>
              <div style={{
                fontSize:12, fontWeight:700, letterSpacing:"0.1em",
                color:demo.col, marginBottom:10
              }}>EDIT THIS — {demo.editLabel.toUpperCase()}</div>
              <textarea
                className="demo-edit"
                rows={3}
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
              />
            </div>

            {/* FULL PROMPT PREVIEW */}
            <div>
              <div style={{
                fontSize:12, fontWeight:700, letterSpacing:"0.1em",
                color:"#6060808", marginBottom:10
              }}>FULL PROMPT PREVIEW</div>
              <div style={{
                background:"#040408",
                border:`1px solid ${demo.col}22`,
                borderLeft:`2px solid ${demo.col}`,
                borderRadius:8, padding:"20px 24px",
                fontSize:"clamp(15px, 2vw, 18px)",
                color:"#9090B8", lineHeight:1.8,
                whiteSpace:"pre-wrap", fontFamily:"DM Sans"
              }}>{finalPrompt}</div>
            </div>

            {/* COPY */}
            <div style={{display:"flex", gap:12, alignItems:"center"}}>
              <button className="copy-demo"
                style={copied ? {background:"rgba(91,224,106,0.15)", color:"#5BE06A", border:"1px solid #5BE06A"} : {}}
                onClick={copy}
              >
                {copied ? "Copied to clipboard" : "Copy Prompt"}
              </button>
              <button
                className="copy-demo"
                style={{background:"transparent", color:demo.col, border:`1px solid ${demo.col}44`}}
                onClick={() => setPhase("output")}
              >
                See Output Example →
              </button>
            </div>
          </div>
        )}

        {/* OUTPUT PHASE */}
        {phase === "output" && (
          <div className="fade-in" style={{display:"flex", flexDirection:"column", gap:20}}>
            <div style={{
              fontSize:12, fontWeight:700, letterSpacing:"0.1em",
              color:"#5BE06A", marginBottom:-8
            }}>WHAT THIS PRODUCES</div>

            <div style={{
              background:"rgba(91,224,106,0.03)",
              border:"1px solid rgba(91,224,106,0.2)",
              borderLeft:"2px solid #5BE06A",
              borderRadius:8, padding:"28px 28px",
              fontSize:"clamp(16px, 2.2vw, 20px)",
              color:"#A0E8B0", lineHeight:2,
              whiteSpace:"pre-wrap", fontFamily:"DM Sans",
              fontWeight:400
            }}>{demo.output}</div>

            <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
              <button
                className="copy-demo"
                style={{background:"transparent", color:"#5A5A7A", border:"1px solid #1A1A32"}}
                onClick={() => setPhase("prompt")}
              >← Back to Prompt</button>
              {activeIdx < DEMO_PROMPTS.length - 1 && (
                <button
                  className="copy-demo"
                  style={{background:`${DEMO_PROMPTS[activeIdx+1].col}`, color:"#07070D"}}
                  onClick={() => switchPrompt(activeIdx + 1)}
                >
                  Next: {DEMO_PROMPTS[activeIdx+1].title} →
                </button>
              )}
            </div>
          </div>
        )}

        {/* BOTTOM BRAND */}
        <div style={{
          marginTop:"auto", paddingTop:24,
          borderTop:"1px solid #0F0F1E",
          display:"flex", alignItems:"center",
          justifyContent:"space-between", flexWrap:"wrap", gap:10
        }}>
          <span style={{fontSize:12, color:"#4A4A6A", letterSpacing:"0.08em", fontWeight:700}}>
            CINEFYPRO.CO · 30 PROFESSIONAL AI PROMPTS · $29
          </span>
          <div style={{
            fontSize:11, fontWeight:700, letterSpacing:"0.1em",
            color:"#6060808"
          }}>STOP STARTING FROM SCRATCH</div>
        </div>
      </div>
    </div>
  );
}


export default function App() {
  const [view, setView] = useState("landing");
  if (view === "demo")    return <DemoMode onBack={() => setView("studio")} />;
  if (view === "gate")    return <AccessGate onUnlock={() => setView("studio")} onBack={() => setView("landing")} />;
  if (view === "studio")  return <Studio onBack={() => setView("landing")} onDemo={() => setView("demo")} />;
  return <Landing onBuy={() => window.open("https://cinefy.gumroad.com/l/mapzvs", "_blank")} onEnterGate={() => setView("gate")} />;
}
