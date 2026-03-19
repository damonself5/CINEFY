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
    prompt:"You are a senior creative director and cinematographer with 15 years of high-end commercial production experience. A client has given me the following brief:\n\n[CLIENT_BRIEF]\n\nMy production budget is approximately [BUDGET]\n\nThe deliverable is [FORMAT]\n\nDecode this brief and return:\n1. The single core emotional message the client actually wants, in one sentence.\n2. Three distinct visual directions — each with a film reference, lighting style, camera movement approach, and one-sentence emotional tone.\n3. Five clarifying questions I should ask before pre-production begins.\n4. One red flag in this brief that could cause scope creep.\n\nBe precise. No generic suggestions. Write like a DP who has been burned by a vague brief before.",
    vars:[{k:"CLIENT_BRIEF",l:"Client Brief",ph:'"We want something that feels authentic and modern for our wellness brand launch."'},{k:"BUDGET",l:"Production Budget",ph:"$15,000 all-in including post-production"},{k:"FORMAT",l:"Deliverable Format",ph:"60-second hero brand film plus three 15-second social cuts"}]
  },
  { id:"002", ch:"01", cat:"Pre-Production & Vision",
    name:"The Shot List Generator",
    desc:"Generate a complete, professional shot list with shot types, focal lengths, camera movements, lighting notes, and emotional function.",
    prompt:"You are a professional cinematographer building a shot list for a [PROJECT_TYPE]\n\nThe creative direction is: [CREATIVE_DIRECTION]\n\nThe shoot location is [LOCATION]\n\nThe primary subject is [SUBJECT]\n\nBuild a complete shot list. For each shot include:\nShot Number / Shot Type (ECU, CU, MS, WS, OTS, POV) / Lens Focal Length / Camera Movement with motivation / Lighting Setup referencing a specific film / Estimated Duration / Emotional Function\n\nInclude: hero shot, establishing shot, B-roll coverage, closing shot.\nTotal shots: [SHOT_COUNT]\nEvery shot must serve the narrative. No filler.",
    vars:[{k:"PROJECT_TYPE",l:"Project Type",ph:"90-second luxury skincare brand film"},{k:"CREATIVE_DIRECTION",l:"Creative Direction",ph:"Intimate golden hour aesthetic referencing Terrence Malick — natural light only"},{k:"LOCATION",l:"Shoot Location",ph:"Modern minimalist apartment, floor-to-ceiling windows facing west"},{k:"SUBJECT",l:"Primary Subject",ph:"Female founder, late 30s, confident and unhurried"},{k:"SHOT_COUNT",l:"Number of Shots",ph:"12 shots"}]
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
    prompt:"You are a professional gaffer and DP designing a lighting setup for this scene:\n\n[SCENE_DESCRIPTION]\n\nEmotional tone: [TONE]\n\nAvailable equipment: [EQUIPMENT]\n\nDesign a complete lighting setup:\n1. Key light — position, quality, modifier, colour temp, and why.\n2. Fill or negative fill — approach and ratio.\n3. Background treatment — lit or unlit and what each communicates.\n4. Practical lights — in-scene sources and how they are enhanced.\n5. One film reference scene this setup is inspired by.\n6. What changes if the subject moves 2 feet toward the window.",
    vars:[{k:"SCENE_DESCRIPTION",l:"Scene Description",ph:"Interior interview. Female CEO, 45. Feeling: authoritative but warm. Modern corner office, two floor-to-ceiling windows facing north."},{k:"TONE",l:"Emotional Tone",ph:"Quietly powerful. Think Vilmos Zsigmond — available-feeling light that is precisely controlled."},{k:"EQUIPMENT",l:"Available Equipment",ph:"Two ARRI SkyPanel S60s, two 4x4 bounce frames, one negative fill flag, one practical desk lamp"}]
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
  ,
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

const CATS = [...new Set(PROMPTS.map(p => p.cat))];
const CH_NAMES = {"01":"Pre-Production","02":"Cinematography","03":"AI Video Tools","04":"Post-Production","05":"Business","06":"Marketing"};

function fillPrompt(template, values) {
  let result = template;
  Object.entries(values).forEach(([k, v]) => {
    if (v) result = result.replaceAll(`[${k}]`, v);
  });
  return result;
}

// ── LANDING PAGE ─────────────────────────────────────────
function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Landing({ onEnter }) {
  return (
    <div style={{background:"#07070D", color:"#F0F0F8", fontFamily:"'DM Sans', sans-serif", lineHeight:1}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #07070D; }
        ::-webkit-scrollbar-thumb { background: #1A1A32; }

        .nav-link {
          color: #5A5A7A; font-size: 14px; font-family: DM Sans; font-weight: 500;
          text-decoration: none; cursor: pointer; letter-spacing: 0.02em;
          transition: color 0.2s; background: none; border: none; padding: 0;
        }
        .nav-link:hover { color: #F0F0F8; }

        .btn-primary {
          background: #4FC3F7; color: #07070D;
          font-family: DM Sans; font-weight: 700;
          font-size: 15px; letter-spacing: 0.02em;
          padding: 12px 28px; border-radius: 6px; border: none;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
          white-space: nowrap;
        }
        .btn-primary:hover { background: #7DD4F8; transform: translateY(-1px); }
        .btn-primary:active { transform: translateY(0); }

        .btn-primary-lg {
          background: #4FC3F7; color: #07070D;
          font-family: DM Sans; font-weight: 700;
          font-size: 17px; letter-spacing: 0.02em;
          padding: 18px 44px; border-radius: 6px; border: none;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
        }
        .btn-primary-lg:hover { background: #7DD4F8; transform: translateY(-1px); }

        .btn-ghost {
          background: transparent; color: #8080A8;
          font-family: DM Sans; font-weight: 500; font-size: 14px;
          padding: 12px 24px; border-radius: 6px;
          border: 1px solid #1A1A32; cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .btn-ghost:hover { border-color: #4FC3F7; color: #F0F0F8; }

        .pain-card {
          background: #0A0A16; border: 1px solid #141428;
          border-radius: 8px; padding: 28px 24px;
          transition: border-color 0.2s;
        }
        .pain-card:hover { border-color: #1E1E3A; }

        .prompt-demo {
          background: #040408; border: 1px solid #1A1A32;
          border-radius: 8px; padding: 20px; font-family: DM Sans;
          font-size: 13px; color: #8080A8; line-height: 1.8;
          white-space: pre-wrap; font-variant-ligatures: none;
        }

        .output-demo {
          background: rgba(91,224,106,0.03);
          border: 1px solid rgba(91,224,106,0.15);
          border-radius: 8px; padding: 20px; font-family: DM Sans;
          font-size: 13px; color: #7DD8A0; line-height: 1.8;
          white-space: pre-wrap;
        }

        .feature-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 0; border-bottom: 1px solid #0F0F1E;
          font-size: 16px; color: #8080A8;
        }
        .feature-row:last-child { border-bottom: none; }

        .pricing-main {
          background: #0A0A18; border: 1px solid #1A1A32;
          border-radius: 12px; padding: 40px 36px;
          max-width: 440px; margin: 0 auto; position: relative;
        }
        .pricing-main::before {
          content: ""; position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #4FC3F7, transparent);
        }

        .guarantee-box {
          max-width: 600px; margin: 0 auto; text-align: center;
          background: #0A0A16; border: 1px solid #1A1A32;
          border-radius: 10px; padding: 36px 32px;
        }

        .section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          color: #3A3A5A; text-transform: uppercase;
          display: block; margin-bottom: 14px;
        }

        .ch-card {
          background: #0A0A14; border-radius: 8px;
          padding: 22px; border: 1px solid #111122;
          transition: border-color 0.2s;
        }
        .ch-card:hover { border-color: #1A1A32; }

        .ch-row {
          font-size: 14px; color: #6060A0; padding: 8px 0;
          border-bottom: 1px solid #0D0D1C; display: flex;
          align-items: center; gap: 10px;
        }
        .ch-row:last-child { border-bottom: none; }

        .ticker-track {
          overflow: hidden; border-top: 1px solid #111120;
          border-bottom: 1px solid #111120;
          background: #070710; padding: 10px 0;
        }
        .ticker-inner {
          display: flex; white-space: nowrap;
          animation: ticker 30s linear infinite;
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .ticker-item {
          font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
          color: #252540; text-transform: uppercase; margin-right: 40px;
          flex-shrink: 0;
        }
        .ticker-sep { color: #4FC3F7; margin-right: 40px; flex-shrink: 0; font-size: 11px; }

        .scarcity-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,179,71,0.06); border: 1px solid rgba(255,179,71,0.18);
          border-radius: 6px; padding: 10px 20px; margin-bottom: 36px;
        }

        .divider { height: 1px; background: #111120; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu1 { animation: fadeUp 0.6s 0.05s both; }
        .fu2 { animation: fadeUp 0.6s 0.18s both; }
        .fu3 { animation: fadeUp 0.6s 0.32s both; }
        .fu4 { animation: fadeUp 0.6s 0.46s both; }

        @media (max-width: 820px) {
          .two-col { grid-template-columns: 1fr !important; }
          .three-col { grid-template-columns: 1fr !important; }
          .hide-mobile { display: none !important; }
          .hero-actions { flex-direction: column !important; align-items: stretch !important; }
          .hero-actions button { text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position:"sticky", top:0, zIndex:200,
        background:"rgba(7,7,13,0.96)", backdropFilter:"blur(16px)",
        borderBottom:"1px solid #111120",
        height:62, display:"flex", alignItems:"center",
        padding:"0 clamp(20px,4vw,48px)", gap:40, justifyContent:"space-between"
      }}>
        <div style={{display:"flex", alignItems:"center", gap:10, flexShrink:0}}>
          <div style={{
            width:30, height:30, borderRadius:"50%",
            border:"1.5px solid #4FC3F7",
            display:"flex", alignItems:"center", justifyContent:"center"
          }}>
            <div style={{width:9, height:9, background:"#FFB347", borderRadius:"50%"}} />
          </div>
          <span style={{fontFamily:"Bebas Neue", fontSize:20, letterSpacing:"0.14em", color:"#F0F0F8"}}>CINEFY</span>
        </div>

        <div className="hide-mobile" style={{display:"flex", gap:32, alignItems:"center"}}>
          <button className="nav-link" onClick={() => scrollTo("pain")}>Why It Works</button>
          <button className="nav-link" onClick={() => scrollTo("inside")}>What's Inside</button>
          <button className="nav-link" onClick={() => scrollTo("examples")}>Examples</button>
          <button className="nav-link" onClick={() => scrollTo("creator")}>About</button>
          <button className="nav-link" onClick={() => scrollTo("pricing")}>Pricing</button>
        </div>

        <button className="btn-primary" onClick={onEnter}>
          Get Access — $29
        </button>
      </nav>

      {/* TICKER */}
      <div className="ticker-track">
        <div className="ticker-inner">
          {[...Array(2)].map((_,i) => (
            <div key={i} style={{display:"flex"}}>
              {["30 AI Prompts","Lighting Setups","Shot Lists","Visual Bibles","Camera Movement","Colour Grades","Client Proposals","Voiceover Scripts","Reel Breakdowns","Runway Prompts"].map((t,j) => (
                <span key={j}><span className="ticker-item">{t}</span><span className="ticker-sep">—</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section style={{
        padding:"clamp(72px,12vw,120px) clamp(20px,5vw,48px) clamp(64px,10vw,100px)",
        maxWidth:900, margin:"0 auto", textAlign:"center"
      }}>
        <div className="fu1" style={{marginBottom:28}}>
          <div style={{
            display:"inline-block", background:"rgba(79,195,247,0.06)",
            border:"1px solid rgba(79,195,247,0.16)", borderRadius:4,
            padding:"5px 14px"
          }}>
            <span style={{fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:"#4FC3F7"}}>
              LAUNCH PRICE — $29
            </span>
          </div>
        </div>

        <h1 className="fu2" style={{
          fontFamily:"Bebas Neue",
          fontSize:"clamp(56px,11vw,104px)",
          lineHeight:0.9, letterSpacing:"0.025em", marginBottom:24
        }}>
          The Filmmaker's<br />
          <span style={{color:"#4FC3F7"}}>AI Bible</span>
        </h1>

        <p className="fu3" style={{
          fontSize:"clamp(17px,2.4vw,22px)", color:"#7070A0",
          lineHeight:1.65, maxWidth:560, margin:"0 auto 12px"
        }}>
          30 AI prompts that instantly create cinematic shots, lighting setups, and scene ideas.
        </p>
        <p className="fu3" style={{
          fontSize:"clamp(15px,1.8vw,18px)", color:"#3A3A5A",
          lineHeight:1.6, maxWidth:480, margin:"0 auto 44px",
          fontStyle:"italic"
        }}>
          Stop staring at a blank timeline.
        </p>

        <div className="fu4 hero-actions" style={{display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap"}}>
          <button className="btn-primary-lg" onClick={onEnter}>
            Get Instant Access — $29
          </button>
          <button className="btn-ghost" onClick={() => scrollTo("examples")}>
            See prompt examples
          </button>
        </div>
        <p className="fu4" style={{fontSize:12, color:"#2A2A40", marginTop:16}}>
          Works with ChatGPT, Claude, and Gemini · Instant delivery · No subscription
        </p>

        <div style={{
          display:"flex", justifyContent:"center", gap:"clamp(28px,5vw,60px)",
          marginTop:56, paddingTop:40, borderTop:"1px solid #111120", flexWrap:"wrap"
        }}>
          {[["30","Prompts"],["6","Chapters"],["1","System"],["∞","Uses"]].map(([v,l]) => (
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontFamily:"Bebas Neue", fontSize:40, color:"#4FC3F7", lineHeight:1}}>{v}</div>
              <div style={{fontSize:11, fontWeight:700, color:"#3A3A5A", letterSpacing:"0.1em", marginTop:5}}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* PAIN */}
      <section id="pain" style={{padding:"80px clamp(20px,5vw,48px)", maxWidth:960, margin:"0 auto"}}>
        <div style={{textAlign:"center", marginBottom:52}}>
          <span className="section-label">The Problem</span>
          <h2 style={{fontFamily:"Bebas Neue", fontSize:"clamp(34px,6vw,56px)", letterSpacing:"0.04em", lineHeight:1}}>
            Every filmmaker knows<br />this feeling.
          </h2>
        </div>

        <div className="three-col" style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:40}}>
          {[
            ["Blank timeline","Every project starts with a blank timeline and a vague brief. The creative direction is in your head — translating it into a shot list or lighting plan takes hours."],
            ["Flat results","You type a prompt into AI. It gives you something generic. The output doesn't sound like a DP — it sounds like a description of a stock photo."],
            ["Starting from scratch","The same research, the same briefs, the same lighting plans — rebuilt from zero on every single project. There is no system."],
          ].map(([t, b]) => (
            <div key={t} className="pain-card">
              <div style={{width:24, height:1, background:"#FFB347", marginBottom:20}} />
              <div style={{fontSize:16, fontWeight:700, marginBottom:10, color:"#E0E0F0"}}>{t}</div>
              <div style={{fontSize:14, color:"#5A5A7A", lineHeight:1.7}}>{b}</div>
            </div>
          ))}
        </div>

        <div style={{
          background:"#070710", border:"1px solid rgba(79,195,247,0.12)",
          borderRadius:8, padding:"28px 32px", textAlign:"center"
        }}>
          <p style={{
            fontFamily:"Bebas Neue", fontSize:"clamp(22px,3.5vw,34px)",
            letterSpacing:"0.04em", color:"#4FC3F7", lineHeight:1.2
          }}>
            What if you could generate cinematic ideas in seconds —<br />in the language a DP actually speaks?
          </p>
        </div>
      </section>

      <div className="divider" />

      {/* SOLUTION */}
      <section style={{padding:"80px clamp(20px,5vw,48px)", background:"#040409"}}>
        <div style={{maxWidth:960, margin:"0 auto", textAlign:"center"}}>
          <span className="section-label">The Solution</span>
          <h2 style={{fontFamily:"Bebas Neue", fontSize:"clamp(34px,6vw,56px)", letterSpacing:"0.04em", marginBottom:16}}>
            The Filmmaker's AI Bible
          </h2>
          <p style={{
            fontSize:"clamp(16px,2vw,18px)", color:"#6060A0",
            maxWidth:580, margin:"0 auto 52px", lineHeight:1.75
          }}>
            30 prompts engineered in the precise technical vocabulary of professional cinematography — designed to produce outputs that sound like a senior DP wrote them, not a text generator.
          </p>

          <div className="three-col" style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, textAlign:"left"}}>
            {[
              {col:"#4FC3F7", tag:"CHAPTERS 01–02", title:"Pre-Production & Cinematography",
               body:"Brief decoder, shot lists, visual bibles, lighting setups, lens packages, camera movement sequences. Everything before the camera rolls."},
              {col:"#B48EF7", tag:"CHAPTER 03", title:"AI Video Tool Prompts",
               body:"Prompts engineered specifically for Runway Gen-3, Sora, and next-gen video tools. Not generic text prompts — cinematic video generation language."},
              {col:"#5BE06A", tag:"CHAPTERS 04–06", title:"Post-Production & Business",
               body:"Edit structure, sound design briefs, colour grade direction, client proposals, scope documents, discovery call frameworks, and a 30-day content calendar."},
            ].map(c => (
              <div key={c.title} style={{
                background:"#07070D", border:`1px solid ${c.col}1A`,
                borderLeft:`2px solid ${c.col}`, borderRadius:6, padding:24
              }}>
                <div style={{fontSize:10, fontWeight:700, letterSpacing:"0.12em", color:c.col, marginBottom:10}}>{c.tag}</div>
                <div style={{fontSize:16, fontWeight:700, marginBottom:10, color:"#E0E0F0", lineHeight:1.3}}>{c.title}</div>
                <div style={{fontSize:14, color:"#5A5A7A", lineHeight:1.7}}>{c.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* WHAT'S INSIDE */}
      <section id="inside" style={{padding:"80px clamp(20px,5vw,48px)", maxWidth:1000, margin:"0 auto"}}>
        <div style={{textAlign:"center", marginBottom:52}}>
          <span className="section-label">What's Inside</span>
          <h2 style={{fontFamily:"Bebas Neue", fontSize:"clamp(34px,6vw,56px)", letterSpacing:"0.04em", marginBottom:8}}>
            Inside the Filmmaker's Bible
          </h2>
          <p style={{fontSize:16, color:"#5A5A7A"}}>6 chapters · 30 prompts · one system</p>
        </div>

        <div className="two-col" style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12}}>
          {[
            {ch:"01", col:"#4FC3F7", title:"Pre-Production & Vision",
             items:["The Brief Decoder","The Shot List Generator","The Visual Bible Builder","The Emotional Shot List","The Mood Board Brief"]},
            {ch:"02", col:"#4FC3F7", title:"Cinematography & Visual Language",
             items:["The Lighting Setup Designer","The Camera Movement Sequence","The Lens Language Advisor","The Colour Palette Generator","The Film Reference Matcher"]},
            {ch:"03", col:"#B48EF7", title:"AI Video Tool Prompts",
             items:["The Runway Cinematic Formula","The Sora Scene Builder","The Hero Shot Generator","The Transition Sequence Prompt","The BTS Content Generator"]},
            {ch:"04", col:"#FFB347", title:"Post-Production & Editorial",
             items:["The Edit Structure Planner","The Sound Design Brief","The Colour Grade Direction","The Voiceover Script Writer","The Pacing Analyzer"]},
            {ch:"05", col:"#FFB347", title:"The Business of Filmmaking",
             items:["The Client Proposal Builder","The Scope of Work Document","The Pricing Justification Script","The Difficult Client Response","The Discovery Call Framework"]},
            {ch:"06", col:"#5BE06A", title:"Content & Self-Marketing",
             items:["The Case Study Writer","The BTS Hook Generator","The Filmmaker Bio Writer","The Reel Breakdown Post","The Content Calendar Builder"]},
          ].map(ch => (
            <div key={ch.ch} className="ch-card">
              <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
                <div style={{
                  fontSize:10, fontWeight:700, letterSpacing:"0.1em",
                  color:ch.col, background:`${ch.col}12`,
                  padding:"3px 10px", borderRadius:3
                }}>CH {ch.ch}</div>
                <span style={{fontSize:14, fontWeight:700, color:"#D0D0E8"}}>{ch.title}</span>
              </div>
              {ch.items.map(item => (
                <div key={item} className="ch-row">
                  <div style={{width:3, height:3, borderRadius:"50%", background:ch.col, flexShrink:0}} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* EXAMPLES */}
      <section id="examples" style={{padding:"80px clamp(20px,5vw,48px)", background:"#040409"}}>
        <div style={{maxWidth:980, margin:"0 auto"}}>
          <div style={{textAlign:"center", marginBottom:52}}>
            <span className="section-label">Prompt Examples</span>
            <h2 style={{fontFamily:"Bebas Neue", fontSize:"clamp(34px,6vw,56px)", letterSpacing:"0.04em", marginBottom:12}}>
              See the difference
            </h2>
            <p style={{fontSize:16, color:"#5A5A7A", maxWidth:520, margin:"0 auto"}}>
              Specificity is the gap between generic AI output and professional cinematic direction.
            </p>
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:32}}>
            {[
              {num:"007", col:"#4FC3F7", title:"The Camera Movement Sequence",
               prompt:`You are a DP designing a camera movement sequence for this scene:

A man receives a phone call that ends his marriage. He is in his kitchen. He hangs up and does not move for 30 seconds.

For each move:
— Starting frame and ending frame
— Type of movement and speed
— What motivates the move in the scene (always motivated, never stylistic)
— What the viewer feels during and after the move

Include at least one completely static shot and explain its function.`,
               result:`MOVE 01 | 0:00–0:20 | LOCKED OFF | 50mm
He answers the phone. We do not move. The stillness IS the setup.

MOVE 02 | 0:20–0:35 | VERY SLOW DOLLY IN | 85mm
Motivated by: the moment he stops speaking. The move is attentive — the way a person leans forward sensing something is wrong.

MOVE 03 | 0:50–1:30 | LOCKED OFF AGAIN | 35mm
He is small in the frame. We do not move. The stillness after movement is louder than the movement was.`},
              {num:"006", col:"#4FC3F7", title:"The Lighting Setup Designer",
               prompt:`You are a professional gaffer and DP designing a lighting setup for this scene:

Interior interview. Female CEO, 45. Feeling: authoritative but warm. Modern corner office, two floor-to-ceiling windows facing north.

Tone: Quietly powerful — available-feeling light that is precisely controlled.
Equipment: Two ARRI SkyPanel S60s, two 4x4 bounce frames, one negative fill flag.

Design: key, fill/negative fill, background treatment, practicals, one film reference.`,
               result:`KEY: S60-C camera-left, 45 degrees, 5600K, quarter grid. 7ft high. Rembrandt triangle camera-side cheek. Ratio: 3:1.

NEGATIVE FILL: 4x4 black flag camera-right, 18 inches from subject. No fill. The shadow is the authority.

BACKGROUND: Leave north window overexposed 1.5 stops. Reads as window, not a light source.

REFERENCE: Janusz Kaminski — Lincoln (2012). The cabinet scenes.`},
              {num:"023", col:"#FFB347", title:"The Pricing Justification Script",
               prompt:`Help me respond to this client pricing objection:

"We love the proposal but your price is about 40% higher than we budgeted. Any flexibility?"

My quote: $24,000
Experience: 8 years, 200+ productions
Project: 3-day commercial shoot, two-camera doc style

Response should hold the price, reframe as investment, offer one scope reduction only, end with a forward-moving question. Tone: warm and direct.`,
               result:`"The $24,000 reflects three days of production and post-production that typically runs 80+ hours on a project like this.

If the budget is firm, one option: we pull back to a single shoot day and I deliver one film instead of three social cuts. Same quality. More focused story.

That said, what you originally described needs what I quoted to be done properly.

Should I scope out the single-day version so you can see exactly what changes?"`},
            ].map(ex => (
              <div key={ex.num} style={{
                background:"#07070D", border:"1px solid #141428",
                borderRadius:10, padding:28
              }}>
                <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:20, paddingBottom:16, borderBottom:"1px solid #0F0F1E"}}>
                  <div style={{fontSize:10, fontWeight:700, letterSpacing:"0.1em", color:ex.col, background:`${ex.col}12`, padding:"3px 10px", borderRadius:3}}>
                    PROMPT {ex.num}
                  </div>
                  <span style={{fontSize:15, fontWeight:700, color:"#D0D0E8"}}>{ex.title}</span>
                </div>
                <div className="two-col" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
                  <div>
                    <div style={{fontSize:10, fontWeight:700, letterSpacing:"0.1em", color:"#3A3A5A", marginBottom:10}}>THE PROMPT</div>
                    <div className="prompt-demo" style={{borderLeft:`2px solid ${ex.col}33`}}>{ex.prompt}</div>
                  </div>
                  <div>
                    <div style={{fontSize:10, fontWeight:700, letterSpacing:"0.1em", color:"#5BE06A", marginBottom:10}}>EXAMPLE OUTPUT</div>
                    <div className="output-demo">{ex.result}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* CREATOR */}
      <section id="creator" style={{padding:"80px clamp(20px,5vw,48px)", maxWidth:720, margin:"0 auto", textAlign:"center"}}>
        <span className="section-label">The Creator</span>
        <div style={{
          width:60, height:60, borderRadius:"50%",
          border:"1.5px solid #4FC3F7",
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 24px"
        }}>
          <div style={{fontFamily:"Bebas Neue", fontSize:20, color:"#4FC3F7", letterSpacing:"0.1em"}}>DC</div>
        </div>
        <h2 style={{fontFamily:"Bebas Neue", fontSize:"clamp(28px,5vw,44px)", letterSpacing:"0.04em", marginBottom:20}}>
          Built by a working filmmaker
        </h2>
        <p style={{fontSize:"clamp(15px,1.8vw,17px)", color:"#6060A0", lineHeight:1.8, marginBottom:20}}>
          These prompts were not written by a prompt engineer. They were built by a filmmaker who understands lighting, composition, and cinematic storytelling — because they needed better tools for their own workflow.
        </p>
        <p style={{fontSize:"clamp(14px,1.6vw,16px)", color:"#404060", lineHeight:1.75, marginBottom:36}}>
          Every prompt was tested on real productions before it made it into this collection. If it did not produce professional-grade output, it did not ship.
        </p>
        <div style={{
          background:"#07070F", border:"1px solid #1A1A32",
          borderRadius:8, padding:"20px 28px",
          fontStyle:"italic", color:"#6060A0",
          fontSize:16, lineHeight:1.65
        }}>
          "I have the vision. I have the gear. I needed a system."
          <div style={{color:"#4FC3F7", fontStyle:"normal", fontWeight:700, fontSize:12, letterSpacing:"0.08em", marginTop:12}}>
            — DAMON · CINEFY
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* PRICING */}
      <section id="pricing" style={{padding:"80px clamp(20px,5vw,48px)", background:"#040409"}}>
        <div style={{maxWidth:960, margin:"0 auto", textAlign:"center"}}>
          <span className="section-label">Pricing</span>
          <h2 style={{fontFamily:"Bebas Neue", fontSize:"clamp(34px,6vw,56px)", letterSpacing:"0.04em", marginBottom:8}}>
            Get Instant Access
          </h2>
          <p style={{fontSize:16, color:"#5A5A7A", marginBottom:40}}>One price. All 30 prompts. Yours forever.</p>

          <div className="scarcity-pill">
            <div style={{width:6, height:6, borderRadius:"50%", background:"#FFB347"}} />
            <span style={{fontSize:13, fontWeight:700, color:"#FFB347"}}>Launch Price: $29</span>
            <span style={{fontSize:13, color:"#404060"}}>— Regular price will be $49</span>
          </div>

          <div className="pricing-main">
            <div style={{fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:"#4FC3F7", marginBottom:24}}>
              THE FILMMAKER'S AI BIBLE
            </div>
            <div style={{display:"flex", alignItems:"baseline", justifyContent:"center", gap:12, marginBottom:6}}>
              <span style={{fontFamily:"Bebas Neue", fontSize:80, color:"#F0F0F8", lineHeight:1}}>$29</span>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:18, color:"#2A2A3A", textDecoration:"line-through"}}>$49</div>
                <div style={{fontSize:11, fontWeight:700, color:"#5BE06A", letterSpacing:"0.08em"}}>SAVE $20</div>
              </div>
            </div>
            <p style={{fontSize:12, color:"#3A3A5A", marginBottom:28}}>One-time purchase · No subscription</p>

            <div style={{marginBottom:28}}>
              {[
                "30 professional AI prompts",
                "6 complete chapters",
                "Interactive prompt studio",
                "Works with ChatGPT, Claude, and Gemini",
                "Instant access — yours forever",
                "Future prompt packs at member price",
              ].map(f => (
                <div key={f} className="feature-row">
                  <div style={{width:16, height:16, borderRadius:"50%", background:"rgba(91,224,106,0.1)", border:"1px solid rgba(91,224,106,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                    <div style={{width:5, height:5, borderRadius:"50%", background:"#5BE06A"}} />
                  </div>
                  <span style={{fontSize:15}}>{f}</span>
                </div>
              ))}
            </div>

            <button className="btn-primary-lg" style={{width:"100%"}} onClick={onEnter}>
              Get The Filmmaker's Bible — $29
            </button>
            <p style={{fontSize:11, color:"#252535", marginTop:12}}>Instant delivery · cinefypro.co</p>
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section style={{padding:"72px clamp(20px,5vw,48px)"}}>
        <div className="guarantee-box">
          <div style={{
            width:40, height:40, borderRadius:"50%",
            border:"1px solid rgba(91,224,106,0.25)",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 20px"
          }}>
            <div style={{width:14, height:14, borderRadius:"50%", border:"1.5px solid #5BE06A"}} />
          </div>
          <h3 style={{fontFamily:"Bebas Neue", fontSize:"clamp(24px,4vw,34px)", letterSpacing:"0.04em", marginBottom:14}}>
            7-Day Money-Back Guarantee
          </h3>
          <p style={{fontSize:"clamp(14px,1.8vw,16px)", color:"#5A5A7A", lineHeight:1.75, maxWidth:440, margin:"0 auto"}}>
            If the Filmmaker's AI Bible does not improve your creative workflow, email us within 7 days for a full refund. No questions asked.
          </p>
        </div>
      </section>

      <div className="divider" />

      {/* FINAL CTA */}
      <section style={{padding:"80px clamp(20px,5vw,48px)", textAlign:"center"}}>
        <div style={{maxWidth:640, margin:"0 auto"}}>
          <h2 style={{
            fontFamily:"Bebas Neue",
            fontSize:"clamp(40px,7vw,72px)",
            letterSpacing:"0.03em", lineHeight:0.92, marginBottom:20
          }}>
            Start Creating Cinematic<br /><span style={{color:"#4FC3F7"}}>Shots Instantly</span>
          </h2>
          <p style={{fontSize:"clamp(15px,1.8vw,18px)", color:"#5A5A7A", lineHeight:1.65, marginBottom:36}}>
            30 prompts. One system. Every project starts with clarity.
          </p>
          <button className="btn-primary-lg" onClick={onEnter}>
            Get The Filmmaker's Bible — $29
          </button>
          <p style={{fontSize:12, color:"#252535", marginTop:14}}>Launch price — regular price will be $49</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop:"1px solid #0F0F1E", padding:"32px clamp(20px,5vw,48px)",
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12
      }}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{width:26, height:26, borderRadius:"50%", border:"1.5px solid #4FC3F7", display:"flex", alignItems:"center", justifyContent:"center"}}>
            <div style={{width:8, height:8, background:"#FFB347", borderRadius:"50%"}} />
          </div>
          <span style={{fontFamily:"Bebas Neue", fontSize:18, letterSpacing:"0.14em"}}>CINEFY</span>
        </div>
        <p style={{fontSize:12, color:"#252535"}}>cinefypro.co · Stop Starting From Scratch.</p>
        <p style={{fontSize:11, color:"#1A1A2A"}}>2026 Cinefy</p>
      </footer>
    </div>
  );
}


// ── PDF EXPORT — DARK CINEMATIC AESTHETIC ─────────────────
const loadJsPDF = () => new Promise((resolve, reject) => {
  if (window.jspdf?.jsPDF) { resolve(window.jspdf.jsPDF); return; }
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  s.onload  = () => resolve(window.jspdf.jsPDF);
  s.onerror = reject;
  document.head.appendChild(s);
});

// ── Colour palette (matches brand) ────────────────────────
const C = {
  black:  [7,   7,  13],
  deep:   [13,  13, 26],
  panel:  [17,  17, 32],
  border: [30,  30, 53],
  blue:   [79,  195, 247],
  amber:  [255, 179, 71],
  green:  [91,  224, 106],
  white:  [240, 240, 248],
  muted:  [90,  90, 122],
  lgrey:  [128, 128, 168],
};

const PW = 210, PH = 297, ML = 16, MR = 16, IW = PW - ML - MR;

// ── shared helpers ─────────────────────────────────────────
function setFill(doc, rgb)   { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }
function setDraw(doc, rgb)   { doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }
function setTxt(doc, rgb)    { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }

function bgPage(doc) {
  setFill(doc, C.black);
  doc.rect(0, 0, PW, PH, 'F');
}

function pageHeader(doc, title, subtitle, pg) {
  // Header bar
  setFill(doc, C.deep);
  doc.rect(0, 0, PW, 22, 'F');
  // Blue rule under header
  setFill(doc, C.blue);
  doc.rect(0, 22, PW, 0.8, 'F');
  // CINEFY
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setTxt(doc, C.white);
  doc.text('CINEFY', ML, 14);
  // Right meta
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  setTxt(doc, C.muted);
  doc.text('CINEFYPRO.CO', PW - MR, 14, { align: 'right' });

  // Title block
  setFill(doc, C.panel);
  doc.rect(0, 22.8, PW, 20, 'F');
  setDraw(doc, C.border);
  doc.setLineWidth(0.3);
  doc.line(0, 42.8, PW, 42.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  setTxt(doc, C.white);
  doc.text(title.toUpperCase(), ML, 34);

  if (subtitle) {
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    setTxt(doc, C.muted);
    doc.text(subtitle, ML, 40);
  }

  // Page num top-right
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  setTxt(doc, C.muted);
  doc.text(`PG ${pg}`, PW - MR, 40, { align: 'right' });

  return 52; // y cursor after header
}

function pageFooter(doc) {
  setFill(doc, C.deep);
  doc.rect(0, PH - 10, PW, 10, 'F');
  setFill(doc, C.blue);
  doc.rect(0, PH - 10, PW, 0.6, 'F');
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  setTxt(doc, C.muted);
  doc.text(
    "CINEFY  ·  THE FILMMAKER'S AI BIBLE  ·  CINEFYPRO.CO  ·  CONFIDENTIAL",
    PW / 2, PH - 4, { align: 'center' }
  );
}

// Section label: "01  SECTION TITLE ——————————"
function sectionLabel(doc, num, title, y) {
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  setTxt(doc, C.amber);
  doc.text(num, ML, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setTxt(doc, C.white);
  doc.text(title.toUpperCase(), ML + 10, y);

  const ruleX = ML + 10 + doc.getTextWidth(title.toUpperCase()) + 4;
  setDraw(doc, C.border);
  doc.setLineWidth(0.4);
  doc.line(ruleX, y - 1, PW - MR, y - 1);

  return y + 9;
}

// Concept card (dark panel with gradient left bar)
function conceptCard(doc, heading, body, y) {
  const lines = doc.splitTextToSize(body, IW - 16);
  const h = lines.length * 5.5 + 18;
  // Panel
  setFill(doc, C.panel);
  setDraw(doc, C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(ML, y, IW, h, 2, 2, 'FD');
  // Left bar — blue top to amber bottom
  setFill(doc, C.blue);
  doc.rect(ML, y, 2.5, h / 2, 'F');
  setFill(doc, C.amber);
  doc.rect(ML, y + h / 2, 2.5, h / 2, 'F');

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  setTxt(doc, C.blue);
  doc.text('// ' + heading.toUpperCase(), ML + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setTxt(doc, C.lgrey);
  doc.text(lines, ML + 6, y + 14);
  return y + h + 6;
}

// Two-column meta row
function metaRow(doc, items, y) {
  const colW = IW / items.length;
  items.forEach(([label, value], i) => {
    const x = ML + i * colW;
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    setTxt(doc, C.muted);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    setTxt(doc, C.blue);
    const v = doc.splitTextToSize(value || '—', colW - 4);
    doc.text(v, x, y + 5.5);
  });
  return y + 14;
}

// Scene block (numbered left col + content right)
function sceneBlock(doc, num, timing, heading, visual, audio, vo, note, y) {
  const leftW = 18;
  const rightW = IW - leftW - 3;

  // Measure total height needed
  const vLines = visual ? doc.splitTextToSize('VISUAL: ' + visual, rightW - 4) : [];
  const aLines = audio  ? doc.splitTextToSize('AUDIO: '  + audio,  rightW - 4) : [];
  const vLines2 = vo    ? doc.splitTextToSize('VO: '     + vo,     rightW - 4) : [];
  const nLines  = note  ? doc.splitTextToSize('NOTE: '   + note,   rightW - 4) : [];

  const allLines = [
    ...(heading ? [heading, ''] : []),
    ...vLines, ...(vLines.length ? [''] : []),
    ...aLines, ...(aLines.length ? [''] : []),
    ...vLines2,...(vLines2.length ? [''] : []),
    ...nLines,
  ];
  const contentH = Math.max(allLines.length * 4.8 + 14, 28);
  const totalH = contentH;

  // Check page overflow
  if (y + totalH > PH - 14) return null; // signal overflow

  // Left col (dark deep bg)
  setFill(doc, C.deep);
  setDraw(doc, C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(ML, y, leftW, totalH, 2, 0, 'FD');

  // Scene number
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  setTxt(doc, C.border);
  doc.text(num.toString().padStart(2, '0'), ML + 2, y + 12);

  // Timing vertical text (approximated horizontal, small)
  doc.setFont('courier', 'normal');
  doc.setFontSize(6);
  setTxt(doc, C.amber);
  doc.text(timing, ML + 2, y + totalH - 5);

  // Right col (panel bg)
  setFill(doc, C.panel);
  doc.roundedRect(ML + leftW + 1, y, rightW, totalH, 0, 2, 'FD');

  const rx = ML + leftW + 4;
  let ry = y + 7;

  // Heading
  if (heading) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    setTxt(doc, C.white);
    doc.text(heading, rx, ry);
    ry += 7;
  }

  // Content blocks
  const blocks = [
    { prefix: 'VISUAL', lines: vLines, col: C.lgrey },
    { prefix: 'AUDIO',  lines: aLines, col: C.muted  },
    { prefix: 'VO',     lines: vLines2,col: C.blue   },
    { prefix: 'NOTE',   lines: nLines, col: C.amber  },
  ];

  blocks.forEach(({ prefix, lines, col }) => {
    if (!lines.length) return;
    doc.setFont('courier', 'bold');
    doc.setFontSize(6.5);
    setTxt(doc, col);
    doc.text(prefix + ' /', rx, ry);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setTxt(doc, col === C.blue ? C.lgrey : col);
    doc.text(lines, rx + doc.getTextWidth(prefix + ' / ') + 1, ry);
    ry += lines.length * 4.8 + 4;
  });

  return y + totalH + 4;
}

// Shot list table row
function shotTableHeader(doc, y) {
  setFill(doc, C.deep);
  doc.rect(ML, y, IW, 7, 'F');
  setDraw(doc, C.border);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, IW, 7, 'S');
  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  setTxt(doc, C.blue);
  const cols = [[0,'SHOT'],[14,'TYPE'],[30,'DESCRIPTION'],[IW-18,'DUR']];
  cols.forEach(([x, label]) => doc.text(label, ML + x + 2, y + 4.8));
  return y + 7;
}

function shotRow(doc, num, type, desc, dur, y, even) {
  const rowH = 8;
  setFill(doc, even ? C.panel : C.deep);
  setDraw(doc, C.border);
  doc.setLineWidth(0.2);
  doc.rect(ML, y, IW, rowH, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  setTxt(doc, C.blue);
  doc.text(String(num).padStart(3,'0'), ML + 2, y + 5.5);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  setTxt(doc, C.amber);
  doc.text(type, ML + 16, y + 5.5);

  const dLines = doc.splitTextToSize(desc, IW - 38);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setTxt(doc, C.lgrey);
  doc.text(dLines[0] || '', ML + 32, y + 5.5);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  setTxt(doc, C.muted);
  doc.text(dur, PW - MR - 2, y + 5.5, { align: 'right' });

  return y + rowH;
}

// CTA block at end
function ctaBlock(doc, y) {
  const h = 28;
  setFill(doc, C.deep);
  setDraw(doc, C.blue);
  doc.setLineWidth(0.5);
  doc.roundedRect(ML, y, IW, h, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  setTxt(doc, C.white);
  doc.text('Stop Starting From Scratch.', PW / 2, y + 10, { align: 'center' });

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  setTxt(doc, C.muted);
  doc.text("The Filmmaker's AI Bible — Available Now", PW / 2, y + 17, { align: 'center' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  setTxt(doc, C.amber);
  doc.text('CINEFYPRO.CO', PW / 2, y + 24, { align: 'center' });
}

// ── PDF: SHOT LIST (Prompt 002) ────────────────────────────
async function exportShotListPDF(fields) {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  bgPage(doc);

  const projectType = fields.PROJECT_TYPE       || 'Untitled Project';
  const direction   = fields.CREATIVE_DIRECTION || '';
  const location    = fields.LOCATION           || '';
  const subject     = fields.SUBJECT            || '';
  const shotCount   = parseInt(fields.SHOT_COUNT) || 10;
  const date        = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  let y = pageHeader(doc, 'Shot List', `${projectType}  ·  ${date}`, 1);

  // Meta row
  y = metaRow(doc, [
    ['Project Type', projectType],
    ['Location', location],
    ['Subject', subject],
    ['Total Shots', String(shotCount)],
  ], y);
  y += 4;

  // Creative direction card
  if (direction) {
    y = sectionLabel(doc, '01', 'Creative Direction', y);
    y = conceptCard(doc, 'Visual Direction', direction, y);
    y += 2;
  }

  // Shot list
  y = sectionLabel(doc, '02', 'Shot List', y);
  y = shotTableHeader(doc, y);

  const shotTypes   = ['ECU','CU','MCU','MS','WS','OTS','POV','INSERT','2-SHOT','STEADICAM'];
  const descriptions = [
    'Hero shot. Hold until the scene establishes itself. No movement.',
    'Slow push in — motivated by the emotional beat. Rack focus at mark.',
    'B-roll coverage. Available light only. No fill.',
    'Establishing wide. Lock off. Let the environment speak.',
    'Reaction shot. Hold two beats longer than comfortable.',
    'Insert. Extreme shallow depth. Subject implied, not shown.',
    'Over-shoulder. Camera breathes — not performing.',
    'POV. Handheld with intention. Not shaky — present.',
    'Two-shot. Equal weight in frame. No hierarchy.',
    'Closing image. The last frame the viewer carries out.',
    'B-roll cutaway. Texture only. No story obligation.',
    'Hero close. The single most important frame of the shoot.',
  ];
  const durations = ['4s','3s','5s','6s','2s','4s','3s','3s','5s','8s','2s','4s'];

  for (let i = 0; i < Math.min(shotCount, 15); i++) {
    if (y > PH - 24) {
      pageFooter(doc); doc.addPage(); bgPage(doc);
      y = pageHeader(doc, 'Shot List (cont.)', projectType, 2);
      y = shotTableHeader(doc, y);
    }
    y = shotRow(doc,
      i + 1,
      shotTypes[i % shotTypes.length],
      descriptions[i % descriptions.length],
      durations[i % durations.length],
      y, i % 2 === 0
    );
  }

  // Notes
  y += 6;
  if (y < PH - 40) {
    y = sectionLabel(doc, '03', 'Production Notes', y);
    setFill(doc, C.panel);
    setDraw(doc, C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(ML, y, IW, 24, 2, 2, 'FD');
    setFill(doc, C.amber);
    doc.rect(ML, y, 2.5, 24, 'F');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    setTxt(doc, C.muted);
    doc.text('Add production notes, crew requirements, or special equipment here.', ML + 6, y + 8);
    y += 30;
  }

  if (y < PH - 34) ctaBlock(doc, y + 4);
  pageFooter(doc);
  doc.save(`cinefy-shot-list-${projectType.toLowerCase().replace(/\s+/g,'-').slice(0,30)}.pdf`);
}

// ── PDF: AD CAMPAIGN BUILDER (Prompt 031) ─────────────────
async function exportCampaignPDF(fields) {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  bgPage(doc);

  const brand     = fields.BRAND        || 'Brand Name';
  const product   = fields.PRODUCT      || '';
  const audience  = fields.AUDIENCE     || '';
  const duration  = fields.DURATION     || '60s';
  const emotion   = fields.EMOTION      || '';
  const visual    = fields.VISUAL_STYLE || '';
  const date      = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  let y = pageHeader(doc, 'Ad Campaign Brief', `${brand}  ·  ${date}`, 1);

  // Meta
  y = metaRow(doc, [
    ['Brand / Client', brand],
    ['Product / Launch', product],
    ['Ad Duration', duration],
    ['Target Audience', audience],
  ], y);
  y += 4;

  // Concept
  y = sectionLabel(doc, '01', 'Campaign Concept', y);
  y = conceptCard(doc, 'Emotional Core',
    emotion || 'The emotional core of this campaign — what the viewer must feel in the final 3 seconds.',
    y
  );
  y += 2;

  // Visual direction
  y = sectionLabel(doc, '02', 'Visual Direction', y);
  y = conceptCard(doc, 'Cinematography & Style', visual || 'Visual and cinematic direction for this campaign.', y);
  y += 2;

  // Scene breakdown
  y = sectionLabel(doc, '03', 'Scene Breakdown', y);

  const scenes = [
    [1, '0:00–0:08', 'The Hook',
     'Open on the problem. No brand. No product. The first frame must earn the next.',
     'Ambient sound only — no music. Room tone.',
     'No voiceover in the open. Let the image do the work.',
     'The hook lives or dies on this first frame. If it does not create a question in the viewer\'s mind, nothing that follows matters.'],
    [2, '0:08–0:20', 'The Tension',
     'Build the problem. The viewer recognises themselves. This moment is about identification, not information.',
     'Music enters low — unresolved. Single note, barely there.',
     '"You know this feeling."',
     null],
    [3, '0:20–0:38', 'The Turn',
     'Product or solution enters frame. This is the pivot. The music resolves. Something shifts.',
     'Music resolves — single piano note, then strings breathe in.',
     '"There is a better way."',
     'The turn must feel earned. If the tension was real, the release will be real. Do not rush to the product.'],
    [4, '0:38–0:52', 'The Proof',
     'Show the outcome. Not features — transformation. What does their life look like after?',
     'Full score. Cinematic swell. Should feel like the opening of a great film.',
     '"This is what changes when you have the right tool."',
     null],
    [5, '0:52–1:00', 'The Close',
     'Cut to brand. Logo. URL. Hold. Silence.',
     'Music resolves to single resonant note. Silence. The restraint IS the brand statement.',
     `"${brand}. Stop starting from scratch."`,
     'Resist the urge to fill this final beat. The confidence of the brand is in what you leave out.'],
  ];

  for (const [num, timing, heading, vis, aud, vo, note] of scenes) {
    if (y > PH - 35) {
      pageFooter(doc); doc.addPage(); bgPage(doc);
      y = pageHeader(doc, 'Ad Campaign Brief (cont.)', brand, 2);
    }
    const result = sceneBlock(doc, num, timing, heading, vis, aud, vo, note, y);
    if (result === null) {
      pageFooter(doc); doc.addPage(); bgPage(doc);
      y = pageHeader(doc, 'Ad Campaign Brief (cont.)', brand, 2);
      y = sceneBlock(doc, num, timing, heading, vis, aud, vo, note, y) || y + 32;
    } else {
      y = result;
    }
  }

  // Shot list
  pageFooter(doc); doc.addPage(); bgPage(doc);
  y = pageHeader(doc, 'Recommended Shot List', brand, 3);
  y = sectionLabel(doc, '04', 'Shot List', y);
  y = shotTableHeader(doc, y);

  const campaignShots = [
    [1,'ECU',   'Blinking cursor on blank page. Tack sharp. Screen softly bokeh behind.',      '4s'],
    [2,'MS PULL','Slow pull back reveals filmmaker at desk. Monitor glow as key light.',         '4s'],
    [3,'INSERT', 'Hands on desk. High contrast. Dark background. Nervous energy.',               '2s'],
    [4,'OTS',    'Over-shoulder on screen — three open tabs. Overwhelmed framing.',              '3s'],
    [5,'INSERT', 'Phone screen — client message. Filmmaker\'s thumb visible.',                   '2s'],
    [6,'CU',     'Filmmaker face. Generic AI result reflected in eyes. Subtle reaction.',        '3s'],
    [7,'OTS',    'Product/solution interface opens. Output populates. Rack focus to screen.',    '4s'],
    [8,'CU',     'Filmmaker leans forward. THE hero shot of the ad. Warm light shift.',         '3s'],
    [9,'MONTAGE','5-shot burst — workflow, motion, creation, golden hour frame.',                '10s'],
    [10,'TITLE', 'Cut to black. Logo. URL. Silence. Hold.',                                      '8s'],
  ];

  campaignShots.forEach(([n, t, d, dur], i) => {
    if (y > PH - 18) {
      pageFooter(doc); doc.addPage(); bgPage(doc);
      y = pageHeader(doc, 'Shot List (cont.)', brand, 4);
      y = shotTableHeader(doc, y);
    }
    y = shotRow(doc, n, t, d, dur, y, i % 2 === 0);
  });

  // Music direction
  y += 8;
  if (y > PH - 60) {
    pageFooter(doc); doc.addPage(); bgPage(doc);
    y = pageHeader(doc, 'Music & Sound Direction', brand, 5);
  }
  y = sectionLabel(doc, '05', 'Music & Sound Direction', y);

  const musicBlocks = [
    ['0:00–0:08',  'Silence',        'No music. Room tone only. Ambient hum. The silence creates tension better than any score.'],
    ['0:08–0:20',  'Low Pulse',      'Subtle unresolved electronic heartbeat. Single note, low frequency. Creates unease without aggression.'],
    ['0:20–0:38',  'The Pivot',      'Single piano note resolves the dissonance. Strings enter softly. The music confirms the emotional turn.'],
    ['0:38–0:52',  'Full Score',     'Cinematic swell. Strings, electronic pulse, building momentum. Should feel like the opening of a great film.'],
    ['0:52–1:00',  'Resolution',     'Music drops to single resonant note as logo appears. Hold two beats. Silence. Restraint is the brand statement.'],
  ];

  musicBlocks.forEach(([timing, label, desc]) => {
    if (y > PH - 20) {
      pageFooter(doc); doc.addPage(); bgPage(doc);
      y = pageHeader(doc, 'Music Direction (cont.)', brand, 5);
    }
    const lines = doc.splitTextToSize(desc, IW - 52);
    const rowH = Math.max(12, lines.length * 4.6 + 8);

    setFill(doc, C.panel);
    setDraw(doc, C.border);
    doc.setLineWidth(0.3);
    doc.rect(ML, y, IW, rowH, 'FD');
    setFill(doc, C.blue);
    doc.rect(ML, y, 2, rowH, 'F');

    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    setTxt(doc, C.amber);
    doc.text(timing, ML + 4, y + rowH/2 + 1);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    setTxt(doc, C.white);
    doc.text(label, ML + 28, y + rowH/2 - (lines.length > 1 ? 2 : 0) + 1);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setTxt(doc, C.lgrey);
    doc.text(lines, ML + 52, y + rowH/2 - (lines.length-1)*2.3 + 1);

    y += rowH + 2;
  });

  y += 6;
  if (y < PH - 34) ctaBlock(doc, y);
  pageFooter(doc);

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
  const outputRef = useRef(null);

  const allCats = ["All", ...CATS];

  const filtered = PROMPTS.filter(p => {
    const matchCat = activeCat === "All" || p.cat === activeCat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const selectPrompt = (p) => {
    setSelected(p);
    setFieldVals({});
    setCopied(false);
  };

  const currentVals = { ...(selected.vars.reduce((a,v) => ({...a,[v.k]:""}),{})), ...fieldVals };
  const finalPrompt = fillPrompt(selected.prompt, currentVals);

  const copyPrompt = () => {
    navigator.clipboard.writeText(finalPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const chCol = CH_COLOR[selected.ch] || COLORS.blue;

  return (
    <div style={{background:COLORS.bg, minHeight:"100vh", fontFamily:"'DM Sans', sans-serif", color:COLORS.white, display:"flex", flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #07070D; } ::-webkit-scrollbar-thumb { background: #1A1A32; border-radius:3px; }
        .p-card { background: #0F0F1C; border: 1px solid #1A1A32; border-radius: 8px; padding: 14px 16px; cursor: pointer; transition: all 0.15s; }
        .p-card:hover { border-color: #2A2A50; background: #111124; }
        .p-card.active { border-color: var(--ch-col); background: #0D0D20; }
        .cat-btn { background: transparent; border: 1px solid #1A1A32; color: #8080A8; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: 500; white-space: nowrap; transition: all 0.15s; font-family: 'DM Sans'; }
        .cat-btn:hover { border-color: #2A2A50; color: #F0F0F8; }
        .cat-btn.active { background: rgba(79,195,247,0.1); border-color: #4FC3F7; color: #4FC3F7; }
        .field-input { background: #07070D; border: 1px solid #1A1A32; color: #F0F0F8; width: 100%; border-radius: 6px; padding: 10px 14px; font-size: 14px; font-family: 'DM Sans'; outline: none; resize: vertical; transition: border-color 0.15s; }
        .field-input:focus { border-color: #4FC3F7; }
        .field-input::placeholder { color: #3A3A5A; }
        .copy-btn { background: linear-gradient(135deg,#4FC3F7,#0077B6); color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 15px; font-weight: 600; font-family: 'DM Sans'; transition: opacity 0.2s; }
        .copy-btn:hover { opacity: 0.88; }
        .output-box { background: #040408; border: 1px solid #1A1A32; border-radius: 8px; padding: 20px; font-family: 'DM Sans'; font-size: 14px; color: #C8C0A8; line-height: 1.8; white-space: pre-wrap; word-break: break-word; min-height: 200px; }
        .sidebar { width: 300px; min-width: 300px; background: #0A0A14; border-right: 1px solid #1A1A32; overflow-y: auto; display: flex; flex-direction: column; height: calc(100vh - 60px); }
        .main-panel { flex: 1; overflow-y: auto; height: calc(100vh - 60px); }
        @media (max-width: 768px) { .studio-layout { flex-direction: column !important; } .sidebar { width: 100% !important; min-width: unset !important; height: auto !important; border-right: none !important; border-bottom: 1px solid #1A1A32; max-height: 40vh; } .main-panel { height: auto !important; } }
      `}</style>

      {/* STUDIO NAV */}
      <div style={{height:60,background:"#0A0A14",borderBottom:"1px solid #1A1A32",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${COLORS.blue}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:10,height:10,background:COLORS.amber,borderRadius:"50%"}} />
          </div>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:"0.12em"}}>CINEFY</span>
          <span style={{color:COLORS.muted,fontSize:13,marginLeft:8}}>/ Prompt Studio</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:13,color:COLORS.muted}}>Prompt {selected.id} of 30</span>
          <div style={{display:"flex",gap:8}}>
            <button onClick={onDemo} style={{background:"rgba(180,142,247,0.08)",border:"1px solid rgba(180,142,247,0.25)",color:"#B48EF7",padding:"6px 16px",borderRadius:6,cursor:"pointer",fontSize:13,fontFamily:"'DM Sans'",fontWeight:600,letterSpacing:"0.04em"}}>Demo Mode</button>
            <button onClick={onBack} style={{background:"transparent",border:`1px solid ${COLORS.border}`,color:COLORS.lgrey,padding:"6px 16px",borderRadius:6,cursor:"pointer",fontSize:13,fontFamily:"'DM Sans'"}}>← Landing</button>
          </div>
        </div>
      </div>

      <div className="studio-layout" style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* SIDEBAR */}
        <div className="sidebar">
          {/* Search */}
          <div style={{padding:"16px 16px 12px"}}>
            <input className="field-input" placeholder="Search prompts..." value={search} onChange={e => setSearch(e.target.value)} style={{width:"100%"}} />
          </div>

          {/* Category pills */}
          <div style={{padding:"0 16px 12px",display:"flex",flexWrap:"wrap",gap:6}}>
            {allCats.map(cat => {
              const shortCat = cat === "All" ? "All" : cat.split(" ")[0];
              return (
                <button key={cat} className={`cat-btn${activeCat===cat?" active":""}`} onClick={() => setActiveCat(cat)} title={cat}>
                  {shortCat}
                </button>
              );
            })}
          </div>

          <div style={{padding:"0 8px",fontSize:12,color:COLORS.muted,letterSpacing:"0.06em",fontWeight:600,paddingBottom:8,paddingLeft:16}}>
            {filtered.length} PROMPT{filtered.length!==1?"S":""}
          </div>

          {/* Prompt list */}
          <div style={{padding:"0 10px 16px",display:"flex",flexDirection:"column",gap:6}}>
            {filtered.map(p => {
              const col = CH_COLOR[p.ch];
              const isActive = selected.id === p.id;
              return (
                <div key={p.id} className={`p-card${isActive?" active":""}`} style={{"--ch-col":col}} onClick={() => selectPrompt(p)}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:11,fontWeight:700,color:col,letterSpacing:"0.06em"}}>{p.id}</span>
                    <span style={{width:4,height:4,borderRadius:"50%",background:col,flexShrink:0}} />
                    <span style={{fontSize:11,color:COLORS.muted,letterSpacing:"0.04em"}}>{CH_NAMES[p.ch]}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{fontSize:14,fontWeight:600,color:isActive?COLORS.white:COLORS.lgrey,lineHeight:1.3}}>{p.name}</div>
                    {PDF_PROMPTS[p.id] && <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.08em",color:"#FFB347",background:"rgba(255,179,71,0.1)",border:"1px solid rgba(255,179,71,0.2)",padding:"2px 6px",borderRadius:3,flexShrink:0}}>PDF</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MAIN PANEL */}
        <div className="main-panel">
          <div style={{padding:28,maxWidth:860}}>

            {/* Prompt header */}
            <div style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span style={{fontSize:12,fontWeight:700,color:chCol,letterSpacing:"0.1em",background:`${chCol}16`,padding:"4px 12px",borderRadius:20}}>
                  PROMPT {selected.id}
                </span>
                <span style={{fontSize:12,color:COLORS.muted}}>CH {selected.ch}  ·  {selected.cat}</span>
              </div>
              <h1 style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:"0.04em",marginBottom:8}}>{selected.name}</h1>
              <p style={{fontSize:16,color:COLORS.lgrey,lineHeight:1.6}}>{selected.desc}</p>
            </div>

            <div style={{height:1,background:COLORS.border,marginBottom:24}} />

            {/* Variable inputs */}
            {selected.vars.length > 0 && (
              <div style={{marginBottom:24}}>
                <div style={{fontSize:13,fontWeight:700,color:COLORS.amber,letterSpacing:"0.08em",marginBottom:16}}>
                  CUSTOMISE YOUR PROMPT
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
                  {selected.vars.map(v => (
                    <div key={v.k}>
                      <label style={{display:"block",fontSize:12,fontWeight:600,color:COLORS.lgrey,letterSpacing:"0.06em",marginBottom:6}}>
                        [{v.k}]
                        <span style={{color:COLORS.muted,fontWeight:400,marginLeft:4}}>— {v.l}</span>
                      </label>
                      <textarea className="field-input"
                        rows={v.ph.length > 60 ? 3 : 2}
                        placeholder={v.ph}
                        value={fieldVals[v.k] || ""}
                        onChange={e => setFieldVals(prev => ({...prev, [v.k]: e.target.value}))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{height:1,background:COLORS.border,marginBottom:24}} />

            {/* Output */}
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10}}>
                <div style={{fontSize:13,fontWeight:700,color:COLORS.green,letterSpacing:"0.08em"}}>
                  YOUR PROMPT — READY TO COPY
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <button className="copy-btn" style={{background:copied?"rgba(91,224,106,0.15)":"linear-gradient(135deg,#4FC3F7,#0077B6)",color:copied?COLORS.green:COLORS.white,border:copied?`1px solid ${COLORS.green}`:"none"}} onClick={copyPrompt}>
                    {copied ? "✓ Copied!" : "Copy Prompt"}
                  </button>
                  {PDF_PROMPTS[selected.id] && (
                    <button className="copy-btn"
                      style={{background:"transparent",border:"1px solid #FFB347",color:"#FFB347",display:"flex",alignItems:"center",gap:8}}
                      onClick={() => PDF_PROMPTS[selected.id](fieldVals)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Download PDF
                    </button>
                  )}
                  <button className="copy-btn" style={{background:"transparent",border:`1px solid ${COLORS.border}`,color:COLORS.lgrey}} onClick={() => setFieldVals({})}>
                    Reset
                  </button>
                </div>
              </div>
              <div className="output-box" ref={outputRef}>{finalPrompt}</div>
              <p style={{fontSize:13,color:COLORS.muted,marginTop:12,lineHeight:1.6}}>
                Paste directly into ChatGPT, Claude, or Gemini. {Object.values(fieldVals).some(v => v) ? "Your custom details are filled in." : "Fill in the fields above to personalise, or paste as-is with the placeholder brackets."}
              </p>
              {PDF_PROMPTS[selected.id] && (
                <div style={{marginTop:16,padding:"14px 18px",background:"rgba(255,179,71,0.04)",border:"1px solid rgba(255,179,71,0.15)",borderLeft:"2px solid #FFB347",borderRadius:6,display:"flex",alignItems:"center",gap:12}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFB347" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  <div>
                    <span style={{fontSize:13,fontWeight:700,color:"#FFB347"}}>Client-Ready PDF Available</span>
                    <span style={{fontSize:13,color:COLORS.muted,marginLeft:8}}>Fill in your details above, then click Download PDF to generate a branded deliverable.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Next prompt nav */}
            <div style={{display:"flex",gap:12,marginTop:32,paddingTop:24,borderTop:`1px solid ${COLORS.border}`}}>
              {PROMPTS.find(p => parseInt(p.id) === parseInt(selected.id)-1) && (
                <button onClick={() => selectPrompt(PROMPTS.find(p => parseInt(p.id) === parseInt(selected.id)-1))}
                  style={{background:"transparent",border:`1px solid ${COLORS.border}`,color:COLORS.lgrey,padding:"10px 20px",borderRadius:6,cursor:"pointer",fontSize:14,fontFamily:"'DM Sans'"}}>
                  ← Previous
                </button>
              )}
              {PROMPTS.find(p => parseInt(p.id) === parseInt(selected.id)+1) && (
                <button onClick={() => selectPrompt(PROMPTS.find(p => parseInt(p.id) === parseInt(selected.id)+1))}
                  style={{background:`${chCol}18`,border:`1px solid ${chCol}`,color:chCol,padding:"10px 20px",borderRadius:6,cursor:"pointer",fontSize:14,fontFamily:"'DM Sans'",marginLeft:"auto"}}>
                  Next Prompt →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
          color: #5A5A7A;
          font-family: DM Sans; font-weight: 600;
          font-size: 13px; letter-spacing: 0.06em;
          padding: 10px 20px; border-radius: 6px;
          cursor: pointer; transition: all 0.15s;
          white-space: nowrap;
        }
        .demo-tab:hover { border-color: #2A2A48; color: #9090B8; }
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
            <span style={{fontSize:13, color:"#3A3A5A", letterSpacing:"0.06em", fontWeight:600}}>
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
                color:"#3A3A5A", marginBottom:10
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
          <span style={{fontSize:12, color:"#252535", letterSpacing:"0.08em", fontWeight:700}}>
            CINEFYPRO.CO · 30 PROFESSIONAL AI PROMPTS · $29
          </span>
          <div style={{
            fontSize:11, fontWeight:700, letterSpacing:"0.1em",
            color:"#3A3A5A"
          }}>STOP STARTING FROM SCRATCH</div>
        </div>
      </div>
    </div>
  );
}


export default function App() {
  const [view, setView] = useState("landing");
  if (view === "demo") return <DemoMode onBack={() => setView("studio")} />;
  return view === "landing"
    ? <Landing onEnter={() => setView("studio")} />
    : <Studio onBack={() => setView("landing")} onDemo={() => setView("demo")} />;
}
