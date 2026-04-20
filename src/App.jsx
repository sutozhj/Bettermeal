import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// ─── SVGs & Icons ─────────────────────────────────────────────────────────────
const Star = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFC107"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
const Shield = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>

// ─── Quiz Data & Flow ────────────────────────────────────────────────────────
const NEXT_MAP = {
  s0: 's1', s1: 's2', s2: 's3', s3: 'lw1',
  lw1: 'lw2', lw2: 'lw3', lw3: 'lw3b', lw3b: 'lw4',
  lw4: (a) => ['plateau', 'gained_back'].includes(a.lw4) ? 'lw5' : 'lw6',
  lw5: 'lw5b', lw5b: 'lw6',
  lw6: 'lw6b', lw6b: 'lw7',
  lw7: 'lw7b', lw7b: 'lw8',
  lw8: 'lw8b', lw8b: 'lw9',
  lw9: 'lw10', lw10: 'lw11', lw11: 'lw11b', lw11b: 'lw12',
  lw12: (a) => a.lw12 === 'yes_event' ? 'lw12b' : 'lw13',
  lw12b: 'lw13',
  lw13: 'lw13b', lw13b: 'lw14', lw14: 'lw14b', lw14b: 'lw15', lw15: 'lw15b', lw15b: 'c1',
  c1: 'c2', c2: 'c3', c3: 'c4', c4: 'c5', c5: 'c6', c6: 'c7'
}

const FLOW = {
  s0: { type: 'landing' },
  s1: { type: 'single', q: "What's your age group?", opts: ['18–29', '30–49', '50–69', '70+'].map(v=>({value:v, label:v})) },
  s2: { type: 'single', q: "What's your sex?", helper: "This helps us estimate your daily calorie needs.", opts: [{value:'male',label:'Male'}, {value:'female',label:'Female'}] },
  s3: { type: 'breather', getHeadline: (a) => a.s2 === 'male' ? "Millions of men have used BetterMeal to get leaner, stronger, and more energized." : "Millions of women have used BetterMeal to feel healthier, stronger, and more confident.", cta: "Let's go!", stats: true, autoAdvance: 5000 },
  lw1: { type: 'single', q: "Why do you want to lose weight?", opts: [ {value:'confident', label:'To feel more confident in my body'}, {value:'health', label:'To improve my overall health and energy'}, {value:'stop_overeating', label:'To stop overeating or emotional eating'}, {value:'special_event', label:'To get ready for a special event'}, {value:'other', label:'Something else'} ]},
  lw2: { type: 'multi', q: "What else would you like to achieve?", opts: [ {value:'relationship', label:'Improve my relationship with food'}, {value:'habits', label:'Build healthier habits'}, {value:'immune', label:'Boost my immune system'}, {value:'sleep', label:'Sleep better and have more energy'}, {value:'comfortable', label:'Feel comfortable in my body'}, {value:'none', label:'None of the above', isExclusive: true} ]},
  lw3: { type: 'multi', q: "What excites you most about reaching your goal?", opts: [ {value:'clothes', label:'Wearing the clothes I love'}, {value:'mirror', label:'Feeling proud and confident when I look in the mirror'}, {value:'energy', label:'Having more energy for my family and work'}, {value:'health', label:"Knowing I'm taking care of my health"}, {value:'measurements', label:'Seeing a real change in my body measurements'}, {value:'other', label:'Something else'} ]},
  lw3b: { type: 'breather', q: "You're already on the right track.", sub: "Setting clear goals is the first step to real change. You're already doing it.", cta: "Let's continue", autoAdvance: 4000 },
  lw4: { type: 'single', q: "What's your experience with losing weight?", opts: [ {value:'lost_before', label:"I've lost weight before and want to keep going"}, {value:'plateau', label:"I've tried before but never reached my goal"}, {value:'gained_back', label:"I've lost weight but always gained it back"}, {value:'first_time', label:"This is my first time trying"} ]},
  lw5: { type: 'multi', q: "What made it hard to lose weight in the past?", opts: [ {value:'motivation', label:'Staying motivated long enough'}, {value:'know_what_to_eat', label:'Knowing what to eat'}, {value:'too_busy', label:'Too busy to plan meals'}, {value:'emotional_eating', label:'Emotional eating or stress eating'}, {value:'plateau_stop', label:'Hitting a plateau and stopping'}, {value:'life_changed', label:'Life circumstances changed'}, {value:'medication', label:'Medication or health condition'}, {value:'other', label:'Other'} ]},
  lw5b: { type: 'breather', q: "That's behind you now.", sub: "This time, your plan is built around exactly what held you back before. We've got you.", cta: "I'm ready", icon: 'calendar' },
  lw6: { type: 'single', q: "Think of someone you know who reached their health goal. What was their key to success?", opts: [ {value:'willpower', label:'Inner willpower'}, {value:'plan', label:'Having a clear plan and structure'}, {value:'habits', label:'Building consistent healthy habits'}, {value:'support', label:'Having a good support system'}, {value:'tools', label:'Using the right tools and app'}, {value:'not_sure', label:"I'm not sure"} ]},
  lw6b: { type: 'breather', q: "You can do this too!", sub: "A perfect plan and a reliable support system make all the difference. That's exactly what you're getting.", cta: "I can't wait!", image: "meal_summary" },
  lw7: { type: 'multi', q: "In the past month, have any of these happened to you?", opts: [ {value:'stress_eating', label:'I ate more than usual when I was stressed or anxious'}, {value:'late_snacking', label:"I snacked late at night even when I wasn't really hungry"}, {value:'guilt', label:'I started a diet then "broke" it and felt guilty about it'}, {value:'none', label:'None of these — I eat with good control', isExclusive: true} ]},
  lw7b: { type: 'breather', q: "That's a great starting point.", sub: "Research shows that tracking your food intake and building awareness of eating patterns has a strong positive effect on long-term results.", cta: "Next", autoAdvance: 4000 },
  lw8: { type: 'multi', q: "How have you tracked calories before?", opts: [ {value:'app', label:'Using an app'}, {value:'website', label:'Using a website'}, {value:'paper', label:'Pen and paper'}, {value:'spreadsheet', label:'Spreadsheet'}, {value:'mental', label:'Mental math'}, {value:'never', label:"I've never tracked calories before", isExclusive: true} ]},
  lw8b: { type: 'breather', q: "BetterMeal makes it easier than anything you've tried.", getSub: (a) => a.lw8?.includes('never') ? "No experience needed. Snap a photo of your meal and we calculate everything for you." : "Millions of food items. Barcode scanner. AI photo recognition. Everything in one place.", cta: "Continue", image: "ai_recognition" },
  lw9: { type: 'single', q: "Have you ever tried intermittent fasting?", opts: [ {value:'yes_love', label:'Yes, I love it'}, {value:'yes_no_work', label:"Yes, but it didn't work for me"}, {value:'no_want', label:'No, but I want to try'}, {value:'no_not_interested', label:"No, I'm not interested"}, {value:'what_is_it', label:'What is intermittent fasting?'} ]},
  lw10: { type: 'multi', q: "How do you plan to stay on track?", opts: [ {value:'log', label:"I'll log all my meals"}, {value:'partner', label:"I'll find an accountability partner"}, {value:'prep', label:"I'll meal prep in advance"}, {value:'streak', label:"I'll track my daily streak"}, {value:'goals', label:"I'll watch my calorie goals"}, {value:'not_sure', label:"I'm not sure yet", isExclusive: true} ]},
  lw11: { type: 'single', q: "How do you feel about starting this journey?", opts: [ {value:'motivated', label:'Motivated and excited'}, {value:'confident', label:'Confident and ready'}, {value:'anxious', label:'A little anxious but willing to try'}, {value:'frustrated', label:"Frustrated because I've failed before"}, {value:'not_motivated', label:'Not very motivated, but I want to change'}, {value:'not_sure', label:"I'm not sure"} ]},
  lw11b: { type: 'breather', q: "We're always here for you.", getSub: (a) => "Starting fresh can be challenging, but you're not alone. Millions of people have reached their goals with us. Now it's your turn." + (a.lw11 === 'frustrated' ? " This time is different. Your plan is built from what hasn't worked for you before." : ""), cta: "Let's do this together!" },
  lw12: { type: 'single', q: "Do you have a special event coming up?", opts: [ {value:'yes_event', label:'Yes — I have a specific event I want to look my best for'}, {value:'no', label:'No — I want to lose weight at a sustainable pace'} ]},
  lw12b: { type: 'custom_event' },
  lw13: { type: 'single', q: "How many minutes a day can you dedicate to tracking?", opts: [ {value:'under_5', label:'Under 5 minutes'}, {value:'5_10', label:'5–10 minutes'}, {value:'10_20', label:'10–20 minutes'}, {value:'as_long', label:"As long as it takes — I'm committed"} ]},
  lw13b: { type: 'breather', q: "Great! Just a few minutes a day makes a huge difference.", autoAdvance: 4000 },
  lw14: { type: 'single', q: "Challenge! How many days in a row do you think you can track?", opts: [ {value:'7', label:'7 days'}, {value:'14', label:'14 days'}, {value:'30', label:'30 days'}, {value:'best', label:"I'll do my best"} ]},
  lw14b: { type: 'breather', q: "Streaks help you stay consistent.", autoAdvance: 4000 },
  lw15: { type: 'single', q: "Do you follow any specific diet?", opts: [ {value:'none', label:'No — I eat a variety of foods'}, {value:'low_red_meat', label:'Low red meat — mostly fish and chicken'}, {value:'vegetarian', label:'Vegetarian'}, {value:'vegan', label:'Vegan'}, {value:'high_protein', label:'High-protein'}, {value:'eat_clean', label:'Eat clean'}, {value:'low_carb', label:'Low-carb'}, {value:'keto', label:'Keto'} ]},
  lw15b: { type: 'breather', q: "Thousands of recipes are waiting for you!", autoAdvance: 4000 },
  c1: { type: 'custom_biometrics' },
  c2: { type: 'custom_goal' },
  c3: { type: 'single', q: "How active are you on a typical day?", helper: "This is about your typical day — not your goals.", opts: [ {value:'1.2', label:'Mostly sitting (desk job, limited movement)'}, {value:'1.375', label:'Lightly active (some walking, occasional exercise)'}, {value:'1.55', label:'Moderately active (3–4 workouts/week)'}, {value:'1.725', label:'Very active (5+ intense sessions/week)'} ]},
  c4: { type: 'loader' },
  c5: { type: 'result' },
  c6: { type: 'paywall' },
  c7: { type: 'checkout' }
}

const variants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { x: { type: 'spring', stiffness: 380, damping: 30 }, opacity: { duration: 0.22 } } },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { x: { type: 'spring', stiffness: 380, damping: 30 }, opacity: { duration: 0.18 } } })
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function ChoiceCard({ label, selected, onClick, isMulti }) {
  return (
    <motion.button onClick={onClick} whileTap={{ scale: 0.97 }} className={`w-full text-left px-5 py-[18px] rounded-2xl border text-[15px] font-medium transition-colors duration-150 focus:outline-none ${selected ? 'border-[#437dff] bg-[#e6f0ff] text-[#2b2b36]' : 'border-gray-200 bg-white text-[#2b2b36] hover:border-gray-300 hover:bg-gray-50'}`}>
      <span className="flex items-center justify-between gap-3">
        {label}
        {isMulti && (
          <span className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors duration-150 ${selected ? 'bg-[#437dff] border-[#437dff]' : 'border-gray-300'}`}>
            {selected && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </span>
        )}
      </span>
    </motion.button>
  )
}

const StarFilled = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffb400" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.745 8.653L21.847 9.255L16.452 13.914L18.09 20.902L12 17.153L5.91 20.902L7.548 13.914L2.153 9.255L9.255 8.653L12 2Z" />
  </svg>
)

const LeftLaurel = () => (
  <svg width="36" height="100" viewBox="0 0 44 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M38 115 C15 95 5 50 15 5" stroke="#ffb400" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M35 105 C20 100 15 90 18 80 C28 85 35 95 35 105Z" fill="#ffb400"/>
    <path d="M27 85 C12 80 7 70 10 60 C20 65 27 75 27 85Z" fill="#ffb400"/>
    <path d="M21 65 C6 60 1 50 4 40 C14 45 21 55 21 65Z" fill="#ffb400"/>
    <path d="M16 45 C1 40 -4 30 -1 20 C9 25 16 35 16 45Z" fill="#ffb400"/>
    <path d="M14 25 C-1 20 -6 10 -3 0 C7 5 14 15 14 25Z" fill="#ffb400"/>
    <path d="M34 95 C45 85 45 75 40 65 C35 75 30 85 34 95Z" fill="#ffb400"/>
    <path d="M26 75 C37 65 37 55 32 45 C27 55 22 65 26 75Z" fill="#ffb400"/>
    <path d="M20 55 C31 45 31 35 26 25 C21 35 16 45 20 55Z" fill="#ffb400"/>
    <path d="M15 35 C26 25 26 15 21 5 C16 15 11 25 15 35Z" fill="#ffb400"/>
  </svg>
)

const RightLaurel = () => (
  <svg width="36" height="100" viewBox="0 0 44 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 115 C29 95 39 50 29 5" stroke="#ffb400" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M9 105 C24 100 29 90 26 80 C16 85 9 95 9 105Z" fill="#ffb400"/>
    <path d="M17 85 C32 80 37 70 34 60 C24 65 17 75 17 85Z" fill="#ffb400"/>
    <path d="M23 65 C38 60 43 50 40 40 C30 45 23 55 23 65Z" fill="#ffb400"/>
    <path d="M28 45 C43 40 48 30 45 20 C35 25 28 35 28 45Z" fill="#ffb400"/>
    <path d="M30 25 C45 20 50 10 47 0 C37 5 30 15 30 25Z" fill="#ffb400"/>
    <path d="M10 95 C-1 85 -1 75 4 65 C9 75 14 85 10 95Z" fill="#ffb400"/>
    <path d="M18 75 C7 65 7 55 12 45 C17 55 22 65 18 75Z" fill="#ffb400"/>
    <path d="M24 55 C13 45 13 35 18 25 C23 35 28 45 24 55Z" fill="#ffb400"/>
    <path d="M29 35 C18 25 18 15 23 5 C28 15 33 25 29 35Z" fill="#ffb400"/>
  </svg>
)

function TrustBadge() {
  return (
    <div className="relative flex flex-col items-center justify-center py-5 px-10 bg-white border border-gray-100 rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] max-w-[340px] mx-auto w-full mb-6">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
         <LeftLaurel />
      </div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
         <RightLaurel />
      </div>
      <span className="text-[#505a6e] font-medium text-[15px] mb-1 z-10">Trusted by over</span>
      <h2 className="text-[#2b3041] font-extrabold text-[32px] tracking-tight leading-none mb-3 z-10">1 Million Users</h2>
      <span className="text-[#505a6e] font-medium text-[15px] mb-2 z-10">4.9 Rating</span>
      <div className="flex gap-1.5 z-10">
        <StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled />
      </div>
    </div>
  )
}

function LandingScreen({ goNext }) {
  useEffect(() => {
    // "tự chuyển sang đi chậm thôi" -> 6000ms
    const timer = setTimeout(() => {
      goNext();
    }, 6000);
    return () => clearTimeout(timer);
  }, [goNext]);

  return (
    <div className="flex flex-col h-full justify-between pb-8 pt-4">
      {/* Header / Titles */}
      <div className="text-center px-4">

         <h1 className="text-[28px] font-extrabold leading-tight mb-3 text-[#2b2b36]">A personalized plan built around your goals</h1>
         <p className="text-[15px] text-gray-500 font-medium px-4">Let's start with a 3-minute quiz to build your plan.</p>
      </div>

      {/* Central Image */}
      <div className="relative w-56 h-56 mx-auto my-8 rounded-full overflow-hidden shadow-2xl border-[6px] border-white z-10 bg-white">
         <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400" alt="Food" className="w-full h-full object-cover" />
      </div>

      {/* Footer / Loading */}
      <div className="flex flex-col px-6 mt-auto">
         
         <div className="w-full flex flex-col items-center justify-center gap-3 py-2">
           <span className="text-xs font-extrabold uppercase tracking-widest text-[#437dff]">Preparing quiz...</span>
           <div className="w-full max-w-[200px] h-[5px] bg-[#e6f0ff] rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-[#0BBC98] rounded-full" 
               initial={{ width: "0%" }} 
               animate={{ width: "100%" }} 
               transition={{ duration: 6, ease: "linear" }} 
             />
           </div>
         </div>
      </div>
    </div>
  )
}

function BreatherScreen({ screen, answers, goNext }) {
  const q = screen.getHeadline ? screen.getHeadline(answers) : screen.q;
  const sub = screen.getSub ? screen.getSub(answers) : screen.sub;

  return (
    <div className="flex flex-col h-full items-center justify-center text-center px-4 py-8">
      {screen.stats && (
        <div className="relative w-full h-[280px] flex items-center justify-center mb-8">
          {/* Subtle glowing globe background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full bg-gradient-to-br from-[#437dff]/10 to-[#ff3b5c]/10 blur-xl pointer-events-none"></div>
          
          <div className="relative w-[300px] h-[280px]">
            {answers.s2 === 'male' ? (
              <>
                <img className="absolute top-[10%] left-[5%] w-14 h-14 rounded-full border-[3px] border-white object-cover shadow-lg z-10 hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80" alt="Male User"/>
                <img className="absolute top-[30%] left-[25%] w-[110px] h-[110px] rounded-full border-[4px] border-white object-cover shadow-xl z-30 hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" alt="Male User"/>
                <img className="absolute top-[5%] right-[15%] w-16 h-16 rounded-full border-[3px] border-white object-cover shadow-lg z-20 hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" alt="Male User"/>
                <img className="absolute top-[45%] right-[5%] w-[84px] h-[84px] rounded-full border-[3px] border-white object-cover shadow-xl z-10 hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80" alt="Male User"/>
                <img className="absolute bottom-[5%] left-[8%] w-[52px] h-[52px] rounded-full border-[3px] border-white object-cover shadow-md z-10 hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80" alt="Male User"/>
                <img className="absolute bottom-[2%] left-[45%] w-[68px] h-[68px] rounded-full border-[3px] border-white object-cover shadow-lg z-20 hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80" alt="Male User"/>
                <img className="absolute bottom-[10%] right-[25%] w-14 h-14 rounded-full border-[3px] border-white object-cover shadow-md z-10 hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=150&q=80" alt="Male User"/>
              </>
            ) : (
              <>
                <img className="absolute top-[10%] left-[5%] w-14 h-14 rounded-full border-[3px] border-white object-cover shadow-lg z-10 hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Female User"/>
                <img className="absolute top-[30%] left-[25%] w-[110px] h-[110px] rounded-full border-[4px] border-white object-cover shadow-xl z-30 hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="Female User"/>
                <img className="absolute top-[5%] right-[15%] w-16 h-16 rounded-full border-[3px] border-white object-cover shadow-lg z-20 hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80" alt="Female User"/>
                <img className="absolute top-[45%] right-[5%] w-[84px] h-[84px] rounded-full border-[3px] border-white object-cover shadow-xl z-10 hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80" alt="Female User"/>
                <img className="absolute bottom-[5%] left-[8%] w-[52px] h-[52px] rounded-full border-[3px] border-white object-cover shadow-md z-10 hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80" alt="Female User"/>
                <img className="absolute bottom-[2%] left-[45%] w-[68px] h-[68px] rounded-full border-[3px] border-white object-cover shadow-lg z-20 hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt="Female User"/>
                <img className="absolute bottom-[10%] right-[25%] w-14 h-14 rounded-full border-[3px] border-white object-cover shadow-md z-10 hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=150&q=80" alt="Female User"/>
              </>
            )}
          </div>
        </div>
      )}
      {screen.icon === 'calendar' && <div className="text-6xl mb-6">📅</div>}
      {screen.image === 'meal_summary' && <div className="w-48 h-48 bg-white rounded-2xl mb-6 shadow-md border border-gray-100 flex items-center justify-center text-gray-400 text-sm italic">📸 Meal Summary App UI</div>}
      {screen.image === 'ai_recognition' && <div className="w-48 h-48 bg-white rounded-2xl mb-6 shadow-md border border-gray-100 flex flex-col items-center justify-center text-gray-400 text-sm italic"><span className="text-4xl mb-2">🤖</span> AI Recognition Demo</div>}
      
      <h2 className="text-3xl font-extrabold text-[#2b2b36] mb-4 leading-tight">{q}</h2>
      {sub && <p className="text-[#6e7079] text-lg font-medium mb-8 leading-relaxed">{sub}</p>}
      
      <button onClick={goNext} className="w-full bg-[#2b2b36] text-white py-4 rounded-[18px] font-semibold text-lg mt-auto hover:bg-[#1a1a24] shadow-lg transition-all active:scale-95">
        {screen.cta || "Continue"}
      </button>
    </div>
  )
}

function EventDateScreen({ answers, setAnswers, goNext }) {
  const date = answers.lw12b_date || '';
  const type = answers.lw12b_type || '';
  const canContinue = date && type;
  return (
    <div className="flex flex-col h-full py-4">
      <h2 className="text-2xl font-bold text-center mb-8 text-[#2b2b36]">When is your event?</h2>
      <div className="mb-6">
        <label className="block text-sm font-bold mb-2 text-gray-700">Event Date</label>
        <input type="date" className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg outline-none focus:border-[#437dff]" value={date} onChange={e=>setAnswers(a=>({...a, lw12b_date: e.target.value}))}/>
      </div>
      <div className="mb-8">
        <label className="block text-sm font-bold mb-2 text-gray-700">Event Type</label>
        <div className="grid grid-cols-2 gap-3">
          {['Wedding', 'Party', 'Beach vacation', 'Trip', 'Health check-up', 'Reunion', 'Work event', 'Other'].map(t => (
            <button key={t} onClick={()=>setAnswers(a=>({...a, lw12b_type: t}))}
              className={`p-3 rounded-xl border-2 text-sm font-bold transition-colors ${type===t ? 'bg-[#e6f0ff] border-[#437dff] text-[#2b2b36]' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <button onClick={goNext} disabled={!canContinue} className={`w-full py-4 rounded-[18px] font-bold text-lg mt-auto transition-all ${canContinue ? 'bg-[#2b2b36] text-white shadow-lg active:scale-95' : 'bg-gray-200 text-gray-400'}`}>Continue</button>
    </div>
  )
}

function BiometricsScreen({ answers, setAnswers, goNext }) {
  const h = answers.c1_height || '';
  const w = answers.c1_weight || '';
  const canContinue = h && w;
  return (
    <div className="flex flex-col h-full py-4">
      <h2 className="text-2xl font-bold text-center mb-2 text-[#2b2b36]">Almost there! A few quick numbers to complete your plan.</h2>
      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 py-1.5 px-3 rounded-full mx-auto w-max mb-8 border border-green-100">
        <Shield/> Your data is encrypted
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-700">Height (cm)</label>
          <input type="number" placeholder="170" className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg outline-none focus:border-[#437dff]" value={h} onChange={e=>setAnswers(a=>({...a, c1_height: e.target.value}))}/>
        </div>
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-700">Current Weight (kg)</label>
          <input type="number" placeholder="75" className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg outline-none focus:border-[#437dff]" value={w} onChange={e=>setAnswers(a=>({...a, c1_weight: e.target.value}))}/>
        </div>
      </div>
      <button onClick={goNext} disabled={!canContinue} className={`w-full py-4 rounded-[18px] font-bold text-lg mt-auto transition-all ${canContinue ? 'bg-[#2b2b36] text-white shadow-lg active:scale-95' : 'bg-gray-200 text-gray-400'}`}>Continue</button>
    </div>
  )
}

function GoalScreen({ answers, setAnswers, goNext }) {
  const w = answers.c2_weight || '';
  const t = answers.c2_timeline || '';
  const canContinue = w && t;
  return (
    <div className="flex flex-col h-full py-4">
      <h2 className="text-2xl font-bold text-center mb-8 text-[#2b2b36]">What's your target weight and timeline?</h2>
      <div className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-700">Target Weight (kg)</label>
          <input type="number" placeholder="65" className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg outline-none focus:border-[#437dff]" value={w} onChange={e=>setAnswers(a=>({...a, c2_weight: e.target.value}))}/>
        </div>
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-700">Timeline Pace</label>
          <div className="flex flex-col gap-3">
             {[ {v:'slow', l:'Lose 0.3 kg/week (slow, sustainable)'}, {v:'med', l:'Lose 0.5 kg/week (recommended)'}, {v:'fast', l:'Lose 0.8 kg/week (fast, ambitious)'} ].map(opt => (
                <button key={opt.v} onClick={()=>setAnswers(a=>({...a, c2_timeline: opt.v}))}
                  className={`p-4 rounded-xl border-2 text-left font-bold transition-colors ${t===opt.v ? 'bg-[#e6f0ff] border-[#437dff] text-[#2b2b36]' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                  {opt.l}
                </button>
             ))}
          </div>
        </div>
      </div>
      <button onClick={goNext} disabled={!canContinue} className={`w-full py-4 rounded-[18px] font-bold text-lg mt-auto transition-all ${canContinue ? 'bg-[#2b2b36] text-white shadow-lg active:scale-95' : 'bg-gray-200 text-gray-400'}`}>Continue</button>
    </div>
  )
}

function LoaderScreen({ goNext }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(()=>setStep(1), 1000);
    const t2 = setTimeout(()=>setStep(2), 2000);
    const t3 = setTimeout(()=>setStep(3), 3000);
    const t4 = setTimeout(()=>setStep(4), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); }
  }, []);

  return (
    <div className="flex flex-col h-full items-center justify-center py-4 text-center">
      {step < 4 ? (
        <div className="w-16 h-16 border-4 border-gray-100 border-t-[#437dff] rounded-full animate-spin mb-8"></div>
      ) : (
        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-3xl mb-8">✓</div>
      )}
      <h2 className="text-2xl font-extrabold mb-8 text-[#2b2b36]">Creating your personalized plan…</h2>
      <div className="flex flex-col gap-5 text-left w-full max-w-[300px] font-medium text-[#2b2b36]">
        <div className={`flex items-center gap-3 transition-opacity duration-500 ${step>=1?'opacity-100':'opacity-30'}`}>
          <span className="text-[#437dff] text-xl">✓</span> Calculated your metabolic rate
        </div>
        <div className={`flex items-center gap-3 transition-opacity duration-500 ${step>=2?'opacity-100':'opacity-30'}`}>
          <span className="text-[#437dff] text-xl">✓</span> Identified your safe weight loss pace
        </div>
        <div className={`flex items-center gap-3 transition-opacity duration-500 ${step>=3?'opacity-100':'opacity-30'}`}>
          <span className="text-[#437dff] text-xl">✓</span> Analyzing your eating patterns
        </div>
      </div>
      {step >= 4 ? (
        <button onClick={goNext} className="w-full mt-auto py-4 rounded-[18px] font-bold text-lg bg-[#2b2b36] text-white shadow-xl hover:bg-[#1a1a24] active:scale-95 transition-all">Show My Plan</button>
      ) : (
        <div className="mt-auto pt-8 flex items-center justify-center gap-2 text-sm font-bold text-gray-600 bg-white py-3 px-6 rounded-2xl shadow-sm border border-gray-100">
           <Star/> 150,000+ people have received their plan
        </div>
      )}
    </div>
  )
}

function ResultScreen({ answers, goNext }) {
  const isEE = answers.lw1 === 'stop_overeating' || (answers.lw5 || []).includes('emotional_eating') || ((answers.lw7 || []).filter(v=>['stress_eating','late_snacking','guilt'].includes(v)).length >= 2);
  const isEvent = answers.lw12 === 'yes_event';
  const isPlateau = answers.lw4 === 'plateau' || answers.lw4 === 'gained_back';

  let variant = 'default';
  if (isEvent) variant = 'event';
  else if (isEE) variant = 'ee';
  else if (isPlateau) variant = 'plateau';

  let headline = "Your weight loss plan is ready.";
  let chartLabel = "Projected Weight Loss";
  if (variant === 'event') {
     headline = `Your ${answers.lw12b_type || 'event'} plan — you've got 8 weeks.`;
  } else if (variant === 'ee') {
     headline = "We understand what's really holding you back.";
     chartLabel = "Breaking the Comfort Eater cycle";
  } else if (variant === 'plateau') {
     headline = "This plan is built from exactly what stopped you before.";
  }

  return (
    <div className="flex flex-col h-full py-2">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#2b2b36] leading-tight mb-3">{headline}</h1>
        <p className="text-gray-500 font-bold">Daily Calorie Target: <span className="text-[#ff3b5c] px-2 py-1 bg-[#fff5f7] rounded-md">1,400 - 1,600 kcal</span></p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mb-6">
         <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-6 text-center">{chartLabel}</h3>
         {/* Fake Chart Illustration */}
         <div className="w-full h-36 relative border-b-2 border-l-2 border-gray-100">
            <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0,20 Q40,30 60,60 T100,90" fill="none" stroke="#437dff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
               {/* Grid lines */}
               <line x1="0" y1="50" x2="100" y2="50" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
            <div className="absolute top-0 -left-2 -translate-x-full text-xs font-bold text-gray-500">{answers.c1_weight || '75'}kg</div>
            <div className="absolute bottom-0 -right-2 translate-x-full text-xs font-bold text-[#437dff]">{answers.c2_weight || '65'}kg</div>
         </div>
      </div>

      <div className="bg-[#f8f9fc] rounded-3xl p-6 mb-8 border border-gray-100">
         <h3 className="font-extrabold mb-4 text-[#2b2b36]">Your customized behavior plan:</h3>
         <ul className="flex flex-col gap-4 text-sm font-medium text-gray-600">
            <li className="flex gap-3 items-start"><span className="text-green-500 mt-0.5">✓</span> <span>Adaptive calorie cycling to prevent metabolism slowdown.</span></li>
            {variant === 'ee' && <li className="flex gap-3 items-start"><span className="text-green-500 mt-0.5">✓</span> <span>CBT-based tools to manage cravings and stress eating.</span></li>}
            {variant === 'plateau' && <li className="flex gap-3 items-start"><span className="text-green-500 mt-0.5">✓</span> <span>Actionable steps to break past your previous weight plateau.</span></li>}
            {variant === 'event' && <li className="flex gap-3 items-start"><span className="text-green-500 mt-0.5">✓</span> <span>Optimized macro ratios for faster, safe results before your event.</span></li>}
            <li className="flex gap-3 items-start"><span className="text-green-500 mt-0.5">✓</span> <span>Daily accountability and streak tracking.</span></li>
         </ul>
      </div>

      <button onClick={goNext} className="w-full py-4 rounded-[18px] font-bold text-lg bg-[#2b2b36] text-white shadow-xl mt-auto hover:bg-[#1a1a24] active:scale-95 transition-all">See My Plan</button>
    </div>
  )
}

function PaywallScreen({ answers, setAnswers, goNext }) {
  const isEE = answers.lw1 === 'stop_overeating' || (answers.lw5 || []).includes('emotional_eating') || ((answers.lw7 || []).filter(v=>['stress_eating','late_snacking','guilt'].includes(v)).length >= 2);
  const isEvent = answers.lw12 === 'yes_event';

  let headline = "Your 12-week weight loss plan — start today.";
  if (isEvent) headline = `8 weeks left until your ${answers.lw12b_type || 'event'} — start now.`;
  else if (isEE) headline = "Start breaking your emotional eating cycle today.";

  const [selected, setSelected] = useState('3m');
  const [bumpChecked, setBumpChecked] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);

  const handleStartPlan = () => {
    if (selected === '1m' || selected === '3m') {
      setShowUpsell(true);
    } else {
      alert("Checkout: " + selected + (bumpChecked ? " + Order Bump" : ""));
    }
  };

  const handleProceedCheckout = (finalPlan) => {
    setShowUpsell(false);
    setAnswers(a => ({ ...a, plan: finalPlan, orderBump: bumpChecked }));
    setTimeout(() => {
      goNext();
    }, 300);
  };

  return (
    <div className="flex flex-col h-full py-2">
      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#437dff] bg-[#e6f0ff] py-1.5 px-3 rounded-full mx-auto mb-6">
        <Shield/> 30-Day Money-Back Guarantee
      </div>
      <h1 className="text-3xl font-extrabold text-center text-[#2b2b36] mb-8 leading-tight">{headline}</h1>

      <div className="flex flex-col gap-4 mb-8">
         {/* Plan 1 */}
         <button onClick={()=>setSelected('1m')} className={`relative w-full border-2 rounded-2xl p-5 text-left transition-all ${selected==='1m' ? 'border-[#2b2b36] bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <div className="flex justify-between items-center mb-1">
               <span className="font-extrabold text-lg text-[#2b2b36]">1 Month</span>
               <span className="font-extrabold text-lg text-[#2b2b36]">$14.99</span>
            </div>
            <div className="text-sm font-bold text-gray-400">$3.74 / week</div>
         </button>

         {/* Plan 3 */}
         <button onClick={()=>setSelected('3m')} className={`relative w-full border-2 rounded-2xl p-5 text-left transition-all ${selected==='3m' ? 'border-[#ff3b5c] bg-[#fff5f7] shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ff3b5c] text-white text-[10px] font-extrabold uppercase tracking-widest py-1 px-3 rounded-full shadow-sm">Most Popular</div>
            <div className="flex justify-between items-center mb-1">
               <span className="font-extrabold text-lg text-[#2b2b36]">3 Months</span>
               <span className="font-extrabold text-lg text-[#2b2b36]">$24.99</span>
            </div>
            <div className="text-sm font-bold text-gray-400">$2.08 / week</div>
         </button>

         {/* Plan 12 */}
         <button onClick={()=>setSelected('12m')} className={`relative w-full border-2 rounded-2xl p-5 text-left transition-all ${selected==='12m' ? 'border-[#437dff] bg-[#e6f0ff] shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#437dff] text-white text-[10px] font-extrabold uppercase tracking-widest py-1 px-3 rounded-full shadow-sm">Best Value</div>
            <div className="flex justify-between items-center mb-1">
               <span className="font-extrabold text-lg text-[#2b2b36]">12 Months</span>
               <span className="font-extrabold text-lg text-[#2b2b36]">$59.99</span>
            </div>
            <div className="text-sm font-bold text-gray-400">$1.25 / week</div>
         </button>
      </div>

      {/* Order Bump */}
      <div className={`p-4 border-2 rounded-2xl mb-6 cursor-pointer transition-colors ${bumpChecked ? 'border-[#437dff] bg-[#e6f0ff]' : 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100'}`} onClick={() => setBumpChecked(!bumpChecked)}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${bumpChecked ? 'bg-[#437dff] border-[#437dff]' : 'border-gray-400 bg-white'}`}>
            {bumpChecked && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
          <div>
             <h4 className="font-extrabold text-[#2b2b36] text-[15px] leading-tight mb-1">Yes, add the 100-Day Recipe Guide (+ $9.99)</h4>
             <p className="text-xs text-gray-500 font-medium">Get lifetime access to our premium high-protein recipes. 80% of users choose this to speed up their progress.</p>
          </div>
        </div>
      </div>

      <button onClick={handleStartPlan} className="w-full py-4 rounded-[18px] font-bold text-lg bg-[#2b2b36] text-white shadow-xl mb-8 hover:bg-[#1a1a24] active:scale-95 transition-all">Start My Plan</button>

      {/* Testimonial */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mt-auto">
         <div className="flex gap-1 mb-3"><Star/><Star/><Star/><Star/><Star/></div>
         <p className="text-sm font-medium text-gray-600 italic mb-3">"This app completely changed my approach. I've lost 15lbs and never felt deprived. It's built perfectly for my lifestyle."</p>
         <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">— Sarah M.</p>
      </div>

      <AnimatePresence>
      {showUpsell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.95, y: 20 }}
             className="bg-white w-full max-w-[360px] rounded-3xl p-6 shadow-2xl relative"
           >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#437dff] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                 <span className="text-3xl">🎁</span>
              </div>
              <div className="pt-10 text-center">
                 <h2 className="text-2xl font-extrabold text-[#2b2b36] mb-3 leading-tight">Wait! Upgrade to 12 Months and save 60%</h2>
                 <p className="text-sm font-medium text-gray-500 mb-6">Users who commit to a year are 3x more likely to reach their goal. Upgrade now for just $59.99 (only $1.25/week).</p>
                 
                 <div className="flex flex-col gap-3">
                   <button onClick={() => {
                     setSelected('12m');
                     handleProceedCheckout('12m');
                   }} className="w-full py-4 rounded-[18px] font-bold text-lg bg-[#437dff] text-white shadow-lg hover:bg-[#3266db] active:scale-95 transition-all">
                     Upgrade My Plan
                   </button>
                   <button onClick={() => {
                     handleProceedCheckout(selected);
                   }} className="w-full py-3 rounded-[18px] font-bold text-[15px] text-gray-400 hover:text-gray-600 transition-colors">
                     No thanks, keep my selection
                   </button>
                 </div>
              </div>
           </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  )
}

function CheckoutScreen({ answers }) {
  const planPrices = { '1m': 14.99, '3m': 24.99, '12m': 59.99 };
  const basePrice = planPrices[answers.plan || '3m'];
  const total = basePrice + (answers.orderBump ? 9.99 : 0);

  return (
    <div className="flex flex-col h-full py-4 px-2">
      <h1 className="text-3xl font-extrabold text-[#2b2b36] mb-8 text-center leading-tight">Complete your purchase</h1>
      
      {/* Express Checkout */}
      <div className="flex flex-col gap-3 mb-8">
        <button className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.42 16.59c-.49.77-1 1.48-1.57 2.15-.89 1.1-1.74 2.22-3.1 2.25-1.34.03-1.76-.8-3.3-.8-1.52 0-2.02.8-3.26.83-1.3.03-2.3-1.2-3.32-2.47-2.1-2.65-3.56-6.84-2.48-9.75.52-1.42 1.54-2.5 2.87-3.1 1.25-.56 2.6-.54 3.78-.05 1.12.46 1.83.84 2.54.84.7 0 1.5-.42 2.76-.92 1.48-.56 2.9-.44 4.02.16 1.05.57 1.83 1.34 2.22 2.23-2.04 1.1-2.4 3.42-1.07 5.04.88 1.08 2.06 1.45 2.1 1.47-.03.07-.34 1.1-.9 1.9zM15.1 4.36c.64-.8 1.05-1.92.93-3.03-1.02.05-2.22.68-2.9 1.5-.6.7-1.1 1.86-.96 2.96 1.14.07 2.27-.63 2.93-1.43z"/>
          </svg>
          <span className="text-[17px]">Pay</span>
        </button>
        <button className="w-full bg-[#ffc439] text-[#003087] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#f4bb36] transition-colors">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.11c-.473 0-.867.317-.98.775l-1.56 8.97a.276.276 0 0 1-.271.261z"/></svg>
          <span className="text-[17px] italic">PayPal</span>
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-gray-400 font-bold text-sm">or pay with card</span>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* Stripe Card Form Mock */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-8">
         <div className="mb-4">
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">Card Information</label>
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-[#437dff] transition-colors">
               <div className="p-3.5 border-b-2 border-gray-200 flex items-center gap-2">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                 <input type="text" placeholder="Card number" className="w-full outline-none font-medium text-[15px] placeholder:text-gray-400" />
               </div>
               <div className="flex">
                  <input type="text" placeholder="MM / YY" className="w-1/2 p-3.5 outline-none font-medium text-[15px] border-r-2 border-gray-200 placeholder:text-gray-400" />
                  <input type="text" placeholder="CVC" className="w-1/2 p-3.5 outline-none font-medium text-[15px] placeholder:text-gray-400" />
               </div>
            </div>
         </div>
         <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">Name on card</label>
            <input type="text" placeholder="Full name" className="w-full border-2 border-gray-200 rounded-xl p-3.5 outline-none font-medium text-[15px] focus:border-[#437dff] transition-colors placeholder:text-gray-400" />
         </div>
      </div>

      <button className="w-full py-4 rounded-[18px] font-bold text-lg bg-[#2b2b36] text-white shadow-xl mt-auto hover:bg-[#1a1a24] active:scale-95 transition-all">
        Pay ${total.toFixed(2)}
      </button>

      <div className="flex items-center justify-center gap-2 mt-6 text-gray-400">
         <Shield />
         <span className="text-xs font-bold uppercase tracking-widest">Guaranteed Safe Checkout</span>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [history, setHistory] = useState(() => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem('bm_history'));
      const hashId = window.location.hash.replace('#', '');
      
      if (savedHistory && Array.isArray(savedHistory) && savedHistory.length > 0) {
        if (!hashId || savedHistory[savedHistory.length - 1] === hashId) {
          return savedHistory;
        }
        const idx = savedHistory.indexOf(hashId);
        if (idx !== -1) {
          return savedHistory.slice(0, idx + 1);
        }
      }
    } catch(e) {}
    return ['s0'];
  });

  const [direction, setDir] = useState(1);

  const [answers, setAnswers] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bm_answers'));
      if (saved && typeof saved === 'object') return saved;
    } catch(e) {}
    return {};
  });

  useEffect(() => {
    localStorage.setItem('bm_history', JSON.stringify(history));
    localStorage.setItem('bm_answers', JSON.stringify(answers));
    
    const currentId = history[history.length - 1];
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash !== currentId) {
      window.history.replaceState(null, '', `#${currentId}`);
    }
  }, [history, answers]);

  useEffect(() => {
    const handleHashChange = () => {
      const hashId = window.location.hash.replace('#', '') || 's0';
      setHistory(prev => {
        const idx = prev.indexOf(hashId);
        if (idx !== -1 && idx !== prev.length - 1) {
          setDir(-1);
          return prev.slice(0, idx + 1);
        }
        return prev;
      });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const currentId = history[history.length - 1]
  const screenDef = FLOW[currentId]
  
  // Progress Bar Calculation (approx 32 steps)
  const progressPct = currentId === 's0' ? 0 : currentId.startsWith('c') && !['c1','c2','c3'].includes(currentId) ? 100 : Math.min((history.length / 32) * 100, 96);
  const noHeader = ['s0', 'c4', 'c5', 'c6', 'c7'].includes(currentId);

  // ── helpers ──
  const goNext = () => {
    const mapVal = NEXT_MAP[currentId];
    const nextId = typeof mapVal === 'function' ? mapVal(answers) : mapVal;
    if (nextId) {
      setDir(1);
      setHistory(h => [...h, nextId]);
    }
  }

  const goBack = () => {
    if (history.length > 1) {
      setDir(-1);
      setHistory(h => h.slice(0, -1));
    }
  }

  const toggleMulti = (key, value, isExclusive) => {
    setAnswers((a) => {
      const prev = a[key] || []
      if (isExclusive) return { ...a, [key]: [value] }
      
      const newArr = prev.includes(value) 
        ? prev.filter((v) => v !== value) 
        : [...prev.filter(v => {
            const opt = FLOW[key].opts.find(o => o.value === v);
            return !(opt && opt.isExclusive);
          }), value];
      return { ...a, [key]: newArr }
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fb] font-sans selection:bg-[#437dff] selection:text-white">
      {/* ── Header ── */}
      {!noHeader && (
        <header className="flex items-center justify-center relative px-4 py-3 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10">
          <AnimatePresence>
            {history.length > 1 && (
              <motion.button
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.18 }}
                onClick={goBack} className="absolute left-4 p-2 text-gray-500 hover:text-[#2b2b36] transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </motion.button>
            )}
          </AnimatePresence>
          <div className="h-6"></div>
        </header>
      )}

      {/* ── Progress bar ── */}
      {!noHeader && currentId !== 's0' && (
        <div className="px-5 pt-5 pb-1 z-10">
          <div className="h-[4px] bg-gray-200 rounded-full overflow-hidden">
            <motion.div className="h-full bg-[#0BBC98] rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ type: 'spring', stiffness: 200, damping: 26 }} />
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="w-full max-w-[440px] mx-auto flex-1 relative overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentId} custom={direction} variants={variants} initial="enter" animate="center" exit="exit"
              className={`absolute inset-0 overflow-y-auto overflow-x-hidden ${currentId === 's0' ? '' : 'px-5 pt-6 pb-10'} flex flex-col`}
            >
              <div className="flex-1 flex flex-col">
                {screenDef.type === 'landing' && <LandingScreen goNext={goNext}/>}
                
                {(screenDef.type === 'single' || screenDef.type === 'multi') && (
                  <div className="flex flex-col h-full">
                    <div className="mb-8">
                      <h1 className="text-[26px] font-extrabold text-[#2b2b36] text-center leading-tight">{screenDef.q}</h1>
                      {screenDef.helper && <p className="text-[15px] font-medium text-gray-400 text-center mt-3">{screenDef.helper}</p>}
                    </div>
                    <div className="flex flex-col gap-3">
                      {screenDef.opts.map(opt => {
                          const val = answers[currentId]
                          const isMulti = screenDef.type === 'multi'
                          const selected = isMulti ? (val||[]).includes(opt.value) : val === opt.value
                          return (
                            <ChoiceCard key={opt.value} label={opt.label} selected={selected} isMulti={isMulti} onClick={() => {
                              if (isMulti) {
                                toggleMulti(currentId, opt.value, opt.isExclusive)
                              } else {
                                const newAnswers = { ...answers, [currentId]: opt.value }
                                setAnswers(newAnswers)
                                setTimeout(() => {
                                  const mapVal = NEXT_MAP[currentId]
                                  const nextId = typeof mapVal === 'function' ? mapVal(newAnswers) : mapVal
                                  if (nextId) {
                                    setDir(1)
                                    setHistory(h => [...h, nextId])
                                  }
                                }, 350)
                              }
                            }}/>
                          )
                      })}
                    </div>
                    {screenDef.type !== 'single' && (
                      <button onClick={goNext} disabled={!answers[currentId] || answers[currentId].length===0} 
                        className={`mt-8 w-full py-4 rounded-[18px] font-bold text-lg transition-all ${answers[currentId] && answers[currentId].length>0 ? 'bg-[#2b2b36] text-white shadow-lg active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                        Continue
                      </button>
                    )}

                  </div>
                )}

                {screenDef.type === 'breather' && <BreatherScreen screen={screenDef} answers={answers} goNext={goNext} />}
                {screenDef.type === 'custom_event' && <EventDateScreen answers={answers} setAnswers={setAnswers} goNext={goNext} />}
                {screenDef.type === 'custom_biometrics' && <BiometricsScreen answers={answers} setAnswers={setAnswers} goNext={goNext} />}
                {screenDef.type === 'custom_goal' && <GoalScreen answers={answers} setAnswers={setAnswers} goNext={goNext} />}
                {screenDef.type === 'loader' && <LoaderScreen goNext={goNext} />}
                {screenDef.type === 'result' && <ResultScreen answers={answers} goNext={goNext} />}
                {screenDef.type === 'paywall' && <PaywallScreen answers={answers} setAnswers={setAnswers} goNext={goNext} />}
                {screenDef.type === 'checkout' && <CheckoutScreen answers={answers} />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Home indicator ── */}
      <div className="flex justify-center pb-2 pt-1 z-10 bg-transparent">
        <div className="w-32 h-1.5 bg-gray-300/50 rounded-full" />
      </div>
    </div>
  )
}
