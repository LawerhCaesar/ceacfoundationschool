import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  ClipboardCheck, Clock, Award, CheckCircle, AlertCircle, Loader2,
  ChevronRight, ChevronLeft, BookOpen, Timer, FileText, Trophy, XCircle, Lock
} from 'lucide-react';
import { supabaseDb } from '@/lib/supabase-db';
import { User, Exam } from '@/types';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const SECTION_A_TIME_LIMIT = 3600; // 1 hour in seconds
const PASS_MARK = 64; // out of 80
const SECTION_A_MAX = 50;
const SECTION_B_MAX = 30;
const TOTAL_MAX = 80;

/** Default class ID used when student has no specific class assigned */
const EXAM_CLASS_ID_PLACEHOLDER = '00000000-0000-0000-0000-000000000001';

// ─── ANSWER KEY ──────────────────────────────────────────────────────────────
// Index 0 = Q1, Index 49 = Q50
const SECTION_A_ANSWER_KEY: string[] = [
  'B','A','B','C','B','A','C', // Q1-7  Class 1
  'C','B','C','B','A','A','A', // Q8-14 Class 2
  'A','C','B','A','A','B',     // Q15-20 Class 3
  'C','B','A','A','A','A',     // Q21-26 Class 4A
  'B','TRUE','B','B','B',      // Q27-31 Class 4B (Q28 is TRUE/FALSE)
  'A','A','B','A','B',         // Q32-36 Class 5
  'B','B','A','B','A',         // Q37-41 Class 6
  'C','A','A','TRUE','A','A','B','A','C', // Q42-50 Class 7 (Q45 is TRUE/FALSE)
];

// ─── QUESTION DATA ────────────────────────────────────────────────────────────
interface SectionAQuestion {
  id: number;
  section: string;
  text: string;
  options: { key: string; label: string }[];
}

const SECTION_A_QUESTIONS: SectionAQuestion[] = [
  // CLASS 1: THE NEW CREATURE (Q1-7)
  { id: 1, section: 'Class 1: The New Creature', text: 'What part of man receives eternal life at the new birth?', options: [{ key: 'A', label: 'The soul' }, { key: 'B', label: 'The spirit' }, { key: 'C', label: 'The body' }] },
  { id: 2, section: 'Class 1: The New Creature', text: '"As a new creature, you belong to the family of God... your life is now one of continuous victory and success" — this statement is:', options: [{ key: 'A', label: 'Completely true, according to scripture' }, { key: 'B', label: 'Partly true, it depends on your feelings and experiences' }, { key: 'C', label: 'Not true, unless you work hard enough to deserve it' }] },
  { id: 3, section: 'Class 1: The New Creature', text: 'According to Romans 10:9, what brings a person salvation?', options: [{ key: 'A', label: 'Confessing all their sins' }, { key: 'B', label: 'Confessing the Lordship of Jesus' }, { key: 'C', label: 'Doing more good than evil' }] },
  { id: 4, section: 'Class 1: The New Creature', text: 'Through the Lordship of Love, you will understand ________', options: [{ key: 'A', label: 'Resolution of Conflicts' }, { key: 'B', label: 'The word of God' }, { key: 'C', label: 'The acceptable will of God' }] },
  { id: 5, section: 'Class 1: The New Creature', text: 'What does submitting to the Lordship of the Spirit involve?', options: [{ key: 'A', label: 'Fasting for many days' }, { key: 'B', label: 'Learning to walk with the Holy Spirit through fellowship' }, { key: 'C', label: 'Speaking in tongues for long hours' }] },
  { id: 6, section: 'Class 1: The New Creature', text: 'As a new creature you receive eternal life in your spirit. You now have the responsibility to renew your mind by feeding on the word of God. This instruction can primarily be found in:', options: [{ key: 'A', label: 'Romans 12:2' }, { key: 'B', label: 'Matthew 28:19' }, { key: 'C', label: 'John 14:26' }] },
  { id: 7, section: 'Class 1: The New Creature', text: 'Which of the following statements does NOT best represent the new creature in Christ Jesus: (i) The new creation is complete in Christ (ii) He is now a citizen of the Kingdom of God (iii) He sits in the place of power in Christ', options: [{ key: 'A', label: 'i and iii' }, { key: 'B', label: 'ii and i' }, { key: 'C', label: 'None of the above' }] },
  // CLASS 2: THE HOLY SPIRIT (Q8-14)
  { id: 8, section: 'Class 2: The Holy Spirit', text: 'When does the baptism of the Holy Spirit occur?', options: [{ key: 'A', label: 'When a believer starts speaking in tongues' }, { key: 'B', label: 'When hands are laid on a person' }, { key: 'C', label: 'When a person is born again' }] },
  { id: 9, section: 'Class 2: The Holy Spirit', text: 'A Christian is required to receive the Holy Spirit to live in him which is a separate experience from salvation, which can also occur at the same moment. This experience is known as:', options: [{ key: 'A', label: 'The Pentecost' }, { key: 'B', label: 'The Infilling of the Holy Spirit' }, { key: 'C', label: 'Spiritual baptism' }] },
  { id: 10, section: 'Class 2: The Holy Spirit', text: 'According to scripture, what best describes who the Holy Spirit is?', options: [{ key: 'A', label: 'A force' }, { key: 'B', label: 'An Angel' }, { key: 'C', label: 'God Himself, co-equal with the Father, the Spirit of truth who proceeds from the Father' }] },
  { id: 11, section: 'Class 2: The Holy Spirit', text: 'We see the first reference to the Holy Spirit in Scriptures in:', options: [{ key: 'A', label: 'Romans 14:6' }, { key: 'B', label: 'Gen 1:2' }, { key: 'C', label: 'Gen 2:18' }] },
  { id: 12, section: 'Class 2: The Holy Spirit', text: 'Which of the following is NOT a part of the many-sided dimensions of the Holy Spirit?', options: [{ key: 'A', label: 'The spirit of miracles' }, { key: 'B', label: 'The spirit of might' }, { key: 'C', label: 'The spirit of wisdom' }] },
  { id: 13, section: 'Class 2: The Holy Spirit', text: 'The primary ministry of the Holy Spirit in the life of a Christian is to empower him/her with:', options: [{ key: 'A', label: 'The dynamic ability to live the Christian life successfully and be an effective witness for Jesus' }, { key: 'B', label: 'Comfort and strength in time of trouble' }, { key: 'C', label: 'Faith and power to perform miracles' }] },
  { id: 14, section: 'Class 2: The Holy Spirit', text: 'When you speak in tongues you __________ yourselves according to 1 Cor 14:4', options: [{ key: 'A', label: 'edify' }, { key: 'B', label: 'cleanse' }, { key: 'C', label: 'understand' }] },
  // CLASS 3: CHRISTIAN DOCTRINE (Q15-20)
  { id: 15, section: 'Class 3: Christian Doctrine', text: 'A Doctrine is:', options: [{ key: 'A', label: 'A recognizable set of beliefs, teachings, values or instructions that are adhered to, believed, taught and practiced by a set of people' }, { key: 'B', label: 'A way of life inherited from birth' }, { key: 'C', label: 'Rule of Law' }] },
  { id: 16, section: 'Class 3: Christian Doctrine', text: 'According to 2 Timothy 3:16, the Bible is described as:', options: [{ key: 'A', label: 'A book that needs updating over time' }, { key: 'B', label: 'A collection of human opinions' }, { key: 'C', label: 'The infallible Word of God that never goes out of fashion' }] },
  { id: 17, section: 'Class 3: Christian Doctrine', text: 'Why is the spiritual Kingdom considered superior to the physical world?', options: [{ key: 'A', label: 'Because it is more mysterious' }, { key: 'B', label: 'Because it pre-existed and gave birth to the physical' }, { key: 'C', label: 'Because only ministers of God can access it' }] },
  { id: 18, section: 'Class 3: Christian Doctrine', text: 'Why are doctrines important in Christianity?', options: [{ key: 'A', label: 'They provide a tested pattern to follow, based on the Word of God' }, { key: 'B', label: 'They are formed from human culture and norms' }, { key: 'C', label: 'They are personal opinions passed from generation to generation' }] },
  { id: 19, section: 'Class 3: Christian Doctrine', text: 'What does the Doctrine of Righteousness reveal?', options: [{ key: 'A', label: 'That righteousness is a gift and a nature received at the new birth' }, { key: 'B', label: 'That righteousness is achieved when your good work is more than your bad work' }, { key: 'C', label: 'That righteousness increases gradually with time and age' }] },
  { id: 20, section: 'Class 3: Christian Doctrine', text: 'What is LW Expansionism?', options: [{ key: 'A', label: 'Blending in with other ministries and following general trends' }, { key: 'B', label: 'The doctrine and endeavor of expanding our reach, influence and territories, through the relentless spreading of our message, by all available and innovative means/services' }, { key: 'C', label: 'Avoiding new ideas to maintain tradition' }] },
  // CLASS 4A: EVANGELISM (Q21-26)
  { id: 21, section: 'Class 4A: Evangelism', text: 'Evangelism refers to reaching someone else with the message that you have believed and which changed your life, with the intention that it:', options: [{ key: 'A', label: 'Opens new religious opportunity' }, { key: 'B', label: 'Causes them to stumble' }, { key: 'C', label: 'Changes their lives also' }] },
  { id: 22, section: 'Class 4A: Evangelism', text: 'What does the distinction between "soul saving" and "soul winning" highlight?', options: [{ key: 'A', label: 'That evangelism is complete once someone listens politely' }, { key: 'B', label: 'Soul Saving is receiving salvation while Soul Winning is the intent' }, { key: 'C', label: 'That numbers are the most important part of ministry' }] },
  { id: 23, section: 'Class 4A: Evangelism', text: 'According to Acts 1:8, what enables a believer to be an effective witness?', options: [{ key: 'A', label: 'The power of the Holy Ghost' }, { key: 'B', label: 'Personal confidence and eloquence' }, { key: 'C', label: 'Attending many Church services' }] },
  { id: 24, section: 'Class 4A: Evangelism', text: 'What is the first step to perfecting soul winning?', options: [{ key: 'A', label: 'Be filled with the Spirit' }, { key: 'B', label: 'Knowledge of the word' }, { key: 'C', label: 'Take them to Church' }] },
  { id: 25, section: 'Class 4A: Evangelism', text: 'Why is it important to explain the Gospel, not just preach it?', options: [{ key: 'A', label: 'Because people may not understand without explanation' }, { key: 'B', label: 'Because preaching is outdated' }, { key: 'C', label: 'Because explaining helps you display your skill' }] },
  { id: 26, section: 'Class 4A: Evangelism', text: 'What should be done after leading someone to Christ?', options: [{ key: 'A', label: "Receive them into God's family and bring them into the Church" }, { key: 'B', label: 'Leave them to study on their own' }, { key: 'C', label: 'Encourage them to attend services in any Church' }] },
  // CLASS 4B: CELL MINISTRY (Q27-31)
  { id: 27, section: 'Class 4B: Cell Ministry', text: 'What is the primary purpose of the Cell Ministry in the Loveworld Nation?', options: [{ key: 'A', label: 'To organize church programs for entertainment' }, { key: 'B', label: "To ensure every member grows, matures, and contributes to the Church's growth" }, { key: 'C', label: 'To replace individual who stopped coming to church' }] },
  { id: 28, section: 'Class 4B: Cell Ministry', text: 'The Cell Ministry is a master strategy that ensures no member is left behind in the Church.', options: [{ key: 'TRUE', label: 'True' }, { key: 'FALSE', label: 'False' }] },
  { id: 29, section: 'Class 4B: Cell Ministry', text: 'What makes the Cell Ministry effective across all Loveworld Churches?', options: [{ key: 'A', label: 'It adapts differently to each location and individual preference' }, { key: 'B', label: 'It is a standardized, Spirit-given strategy that produces predictable results regardless of location' }, { key: 'C', label: 'It depends on the popularity of the Pastor in each church' }] },
  { id: 30, section: 'Class 4B: Cell Ministry', text: 'How often does the Cell meet?', options: [{ key: 'A', label: 'Once a month' }, { key: 'B', label: 'Once a week' }, { key: 'C', label: 'Whenever they want' }] },
  { id: 31, section: 'Class 4B: Cell Ministry', text: 'How are members assigned to a Cell when they come directly to the Church?', options: [{ key: 'A', label: 'They are allowed to choose randomly' }, { key: 'B', label: 'The Pastor or designated official places them in a Cell best suited for growth and development' }, { key: 'C', label: 'They are not required to join any Cell' }] },
  // CLASS 5: CHRISTIAN CHARACTER & PROSPERITY (Q32-36)
  { id: 32, section: 'Class 5: Christian Character & Prosperity', text: "Spiritual Growth can be seen in the quality of a Christian's:", options: [{ key: 'A', label: 'Character' }, { key: 'B', label: 'Strength' }, { key: 'C', label: 'Religious beliefs' }] },
  { id: 33, section: 'Class 5: Christian Character & Prosperity', text: 'What is the difference between salvation and spiritual growth?', options: [{ key: 'A', label: 'Salvation is instant by faith, while growth is gradual through the Word and Spirit' }, { key: 'B', label: 'Salvation is earned by works, while growth is automatic' }, { key: 'C', label: 'Salvation and growth happen the same way' }] },
  { id: 34, section: 'Class 5: Christian Character & Prosperity', text: 'How does walking in the Spirit help a Christian grow in character?', options: [{ key: 'A', label: 'It allows them to fulfill the desires of the flesh selectively' }, { key: 'B', label: 'It replaces bad habits with good ones and prevents sinful behavior' }, { key: 'C', label: 'It ensures that worldly habits can continue without immediate consequences' }] },
  { id: 35, section: 'Class 5: Christian Character & Prosperity', text: "What is the fundamental principle of prosperity in God's Kingdom?", options: [{ key: 'A', label: 'Giving, which leads to receiving and abundance (Luke 6:38)' }, { key: 'B', label: 'Saving money for more investments' }, { key: 'C', label: 'Working very hard to earn more money' }] },
  { id: 36, section: 'Class 5: Christian Character & Prosperity', text: 'What is the significance of "Partnership Seeds" in giving?', options: [{ key: 'A', label: 'They are optional donations with no expectation' }, { key: 'B', label: 'They are definite and consistent commitments to further the work and impact of the Ministry' }, { key: 'C', label: 'They replace the need for tithes or first fruits' }] },
  // CLASS 6: THE LOCAL ASSEMBLY & LOVEWORLD INC. (Q37-41)
  { id: 37, section: 'Class 6: The Local Assembly & Loveworld Inc.', text: 'What does the word Church (Ecclesia in Greek) mean?', options: [{ key: 'A', label: 'The place where Christians worship' }, { key: 'B', label: 'The gathering of the called-out people' }, { key: 'C', label: 'The building dedicated to God' }] },
  { id: 38, section: 'Class 6: The Local Assembly & Loveworld Inc.', text: 'What is the Universal Church?', options: [{ key: 'A', label: 'Every person in the world irrespective of their religion' }, { key: 'B', label: 'The entire Body of Christ on earth from its inception till date' }, { key: 'C', label: 'Churches with branches around the globe' }] },
  { id: 39, section: 'Class 6: The Local Assembly & Loveworld Inc.', text: 'Why must every Christian be part of a Local Assembly?', options: [{ key: 'A', label: 'To be nurtured, grow, and function effectively in the Body of Christ' }, { key: 'B', label: 'To have a registered church identity card' }, { key: 'C', label: 'To outgrow other churches' }] },
  { id: 40, section: 'Class 6: The Local Assembly & Loveworld Inc.', text: 'What is your first and most important responsibility as a member of a Local Assembly?', options: [{ key: 'A', label: 'To give financially' }, { key: 'B', label: 'To attend corporate Services consistently' }, { key: 'C', label: 'To join a service Unit' }] },
  { id: 41, section: 'Class 6: The Local Assembly & Loveworld Inc.', text: 'In Christ Embassy we believe in the __________ of the church, and the Second Coming of Christ.', options: [{ key: 'A', label: 'Rapture' }, { key: 'B', label: 'Continuity' }, { key: 'C', label: 'Judgement' }] },
  // CLASS 7: MOBILE TECHNOLOGY (Q42-50)
  { id: 42, section: 'Class 7: Mobile Technology', text: '__________ is the sum of techniques, skills, methods, and processes used in the production of goods or services or in the accomplishment of objectives. It is the current state of humanity\'s knowledge of how to combine resources to produce desired products, to solve problems, fulfil needs and satisfy wants.', options: [{ key: 'A', label: 'Manufacturing' }, { key: 'B', label: 'Production' }, { key: 'C', label: 'Technology' }] },
  { id: 43, section: 'Class 7: Mobile Technology', text: 'Technology that goes where the user goes is called what?', options: [{ key: 'A', label: 'Mobile Technology' }, { key: 'B', label: 'Mobile Phones' }, { key: 'C', label: 'Static Technology' }] },
  { id: 44, section: 'Class 7: Mobile Technology', text: 'These are crucial roles technology plays in effective evangelism EXCEPT:', options: [{ key: 'A', label: 'It expands the reach of the gospel on a global scale' }, { key: 'B', label: "It increases the Church's financial resources without spiritual impact" }, { key: 'C', label: 'It is an essential tool for accessing information and resources that foster growth' }] },
  { id: 45, section: 'Class 7: Mobile Technology', text: 'It is desirable for all members of our Church to have sufficient knowledge of our Ministry Technology Platforms and Apps, and how to use them for personal growth, access information, contribute and share information, and how to use them to reach souls and disciple others.', options: [{ key: 'TRUE', label: 'True' }, { key: 'FALSE', label: 'False' }] },
  { id: 46, section: 'Class 7: Mobile Technology', text: 'One of the benefits of using the Soultracker App for evangelical work is:', options: [{ key: 'A', label: 'It makes it easier to track and follow up with new converts' }, { key: 'B', label: 'It complicates the process of discipleship' }, { key: 'C', label: 'It is too technical for most believers' }] },
  { id: 47, section: 'Class 7: Mobile Technology', text: 'Which of these days are the designated prayer times for Pastor Chris Live prayers?', options: [{ key: 'A', label: 'Mondays, Wednesdays & Friday (12:00pm & 10:00pm Local Time)' }, { key: 'B', label: 'Mondays, Tuesdays & Thursdays (12:00 GMT+1 & 10:00pm GMT+1)' }, { key: 'C', label: 'Mondays, Wednesdays & Friday (3:00pm GMT+1 & 10:00pm GMT+1)' }] },
  { id: 48, section: 'Class 7: Mobile Technology', text: '__________ is an online replica of the Foundation School.', options: [{ key: 'A', label: 'FS online Dashboard' }, { key: 'B', label: 'Online FS Class Portal' }, { key: 'C', label: 'FS Resource Center' }] },
  { id: 49, section: 'Class 7: Mobile Technology', text: '__________ is a repository of testimonies of Salvation, Soul winning exploits, healing and transformation from FS Students.', options: [{ key: 'A', label: 'FS Testimony Bank' }, { key: 'B', label: 'Online FS Portal' }, { key: 'C', label: 'FS Resources Center' }] },
  { id: 50, section: 'Class 7: Mobile Technology', text: '__________ allows you to create healing centers, get regular updates/reports and also partner in the healing streams Live Healing Services with our Man of God.', options: [{ key: 'A', label: 'Rhapsody App' }, { key: 'B', label: 'Online FS Portal' }, { key: 'C', label: 'Herald App' }] },
];

interface SectionBQuestion {
  id: number;
  book: string;
  text: string;
}

const SECTION_B_QUESTIONS: SectionBQuestion[] = [
  { id: 1, book: 'Now That You Are Born Again', text: 'According to the Book "Now That You Are Born Again" — what does it mean to be born again?' },
  { id: 2, book: 'Now That You Are Born Again', text: 'How is salvation primarily received?' },
  { id: 3, book: 'Now That You Are Born Again', text: "The fact that you are a New Creature inside doesn't mean that outwardly you'll look different. Discuss." },
  { id: 4, book: 'The Seven Spirits of God', text: 'What does the term "The Seven Spirits of God" represent according to the book "The Seven Spirits of God"?' },
  { id: 5, book: 'The Seven Spirits of God', text: 'Which scripture reference introduces us to the Seven Spirits of God?' },
  { id: 6, book: 'The Seven Spirits of God', text: 'According to the book, the Spirit of the Lord signifies:' },
  { id: 7, book: 'The Seven Spirits of God', text: 'Complete the following statement: "Wisdom is the principal thing; therefore, get wisdom: and with all thy getting get ________"' },
  { id: 8, book: 'Join this Chariot', text: 'Which of the following best captures the role of faith in the process of "joining the chariot"?' },
  { id: 9, book: 'Join this Chariot', text: 'What is the ultimate promise for those who "join the chariot" as highlighted in the book?' },
  { id: 10, book: 'Join this Chariot', text: "What was Joseph's purpose in Egypt according to Genesis 45:1-5?" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function gradeAnswers(answers: Record<string, string>): number {
  return SECTION_A_ANSWER_KEY.reduce((score, correct, idx) => {
    const q = idx + 1;
    return answers[q] === correct ? score + 1 : score;
  }, 0);
}

// ─── PROPS ───────────────────────────────────────────────────────────────────
interface ExamSectionProps {
  user: User;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const ExamSection = ({ user }: ExamSectionProps) => {
  const [exam, setExam] = useState<Exam | null | undefined>(undefined); // undefined = loading
  const [examLocked, setExamLocked] = useState(true);
  const [examState, setExamState] = useState<
    'loading' | 'locked' | 'intro' | 'section_a' | 'section_a_complete' | 'section_b' | 'awaiting' | 'results'
  >('loading');

  // Section A state
  const [sectionAAnswers, setSectionAAnswers] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(0); // 0-4 (10 questions each)
  const QUESTIONS_PER_PAGE = 10;
  const totalPages = Math.ceil(SECTION_A_QUESTIONS.length / QUESTIONS_PER_PAGE);

  // Timer
  const [timeLeft, setTimeLeft] = useState(SECTION_A_TIME_LIMIT);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timerActive, setTimerActive] = useState(false);

  // Section B state
  const [sectionBAnswers, setSectionBAnswers] = useState<string[]>(Array(10).fill(''));
  const [currentBQuestion, setCurrentBQuestion] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ── Load existing exam record on mount ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      // Check lock status first
      const locked = await supabaseDb.getExamLocked();
      setExamLocked(locked);

      const existing = await supabaseDb.getStudentExam(user.id);
      setExam(existing);

      // If exam is mid-way, never show the locked state — student has already started
      if (existing && existing.status !== 'not_started') {
        if (existing.status === 'section_a_complete') setExamState('section_b');
        else if (existing.status === 'section_b_submitted') setExamState('awaiting');
        else if (existing.status === 'fully_graded') setExamState('results');
        else setExamState('intro');
      } else if (locked) {
        setExamState('locked');
      } else {
        setExamState('intro');
      }
    };
    load();
  }, [user.id]);

  // ── Timer logic ─────────────────────────────────────────────────────────────
  const handleAutoSubmitSectionA = useCallback(async () => {
    if (!exam) return;
    setTimerActive(false);
    setSubmitting(true);
    const score = gradeAnswers(sectionAAnswers);
    try {
      await supabaseDb.submitSectionA(exam.id, sectionAAnswers, score);
      setExam(prev => prev ? { ...prev, sectionAScore: score, status: 'section_a_complete' } : prev);
      setExamState('section_a_complete');
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [exam, sectionAAnswers]);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmitSectionA();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, handleAutoSubmitSectionA]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleStartExam = async () => {
    setSubmitting(true);
    setError('');
    try {
      // Use the first enrolled classId or a placeholder
      const enrollments = await supabaseDb.getStudentEnrollments(user.id);
      const classId = enrollments[0]?.classId ?? EXAM_CLASS_ID_PLACEHOLDER;
      const newExam = await supabaseDb.startExam(user.id, classId);
      setExam(newExam);
      setExamState('section_a');
      setTimerActive(true);
    } catch {
      setError('Could not start exam. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectAnswer = (questionId: number, answer: string) => {
    setSectionAAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitSectionA = async () => {
    if (!exam) return;
    // Ensure all answered (warn but allow partial submit)
    setSubmitting(true);
    setError('');
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const score = gradeAnswers(sectionAAnswers);
    try {
      await supabaseDb.submitSectionA(exam.id, sectionAAnswers, score);
      setExam(prev => prev ? { ...prev, sectionAScore: score, status: 'section_a_complete' } : prev);
      setExamState('section_a_complete');
    } catch {
      setError('Failed to submit Section A. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitSectionB = async () => {
    if (!exam) return;
    setSubmitting(true);
    setError('');
    try {
      await supabaseDb.submitSectionB(exam.id, sectionBAnswers);
      setExam(prev => prev ? { ...prev, sectionBAnswers, status: 'section_b_submitted' } : prev);
      setExamState('awaiting');
    } catch {
      setError('Failed to submit Section B. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const pageQuestions = SECTION_A_QUESTIONS.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );
  const answeredCount = Object.keys(sectionAAnswers).length;
  const timerWarning = timeLeft < 300; // last 5 minutes

  // ── RENDER ──────────────────────────────────────────────────────────────────

  if (examState === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // LOCKED BY ADMIN
  if (examState === 'locked') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Foundation School Exam</h2>
          <p className="text-muted-foreground">2026 1st Quarter Examination</p>
        </div>
        <Card className="border-muted">
          <CardContent className="py-16 flex flex-col items-center text-center gap-5">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Exam Not Yet Available</h3>
              <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
                The exam has not been opened yet. Your admin will unlock it when the time comes.
                Please check back later.
              </p>
            </div>
            <Badge variant="outline" className="text-sm px-4 py-1.5">
              🔒 Locked by Administrator
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  // INTRO
  if (examState === 'intro') {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Foundation School Exam</h2>
          <p className="text-muted-foreground mt-1">2026 1st Quarter Examination</p>
        </div>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="w-5 h-5 text-primary" /> Exam Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: FileText, label: 'Total Questions', value: '60' },
              { icon: Clock, label: 'Time Limit', value: '1 Hour (Sec A)' },
              { icon: Award, label: 'Pass Mark', value: `${PASS_MARK}/${TOTAL_MAX}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 bg-background rounded-lg p-3 border">
                <div className="p-2 bg-primary/10 rounded-lg"><Icon className="w-5 h-5 text-primary" /></div>
                <div><p className="text-lg font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Exam Structure</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">A</div>
              <div>
                <p className="font-semibold text-foreground">Section A — Objectives (50 Marks)</p>
                <p className="text-sm text-muted-foreground">50 multiple-choice questions covering all 7 Foundation School classes. Auto-graded instantly upon submission. <strong>1 hour time limit.</strong></p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-800">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">B</div>
              <div>
                <p className="font-semibold text-foreground">Section B — Theory (30 Marks)</p>
                <p className="text-sm text-muted-foreground">10 questions from the books: <em>Now That You Are Born Again</em>, <em>The Seven Spirits of God</em>, and <em>Join This Chariot</em>. Graded by your teacher.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="pt-4">
            <div className="flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                <p className="font-semibold">Before you begin:</p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-700 dark:text-amber-300">
                  <li>Section A has a strict <strong>1-hour time limit</strong>. The exam auto-submits when time runs out.</li>
                  <li>You can only take this exam <strong>once</strong>. Your answers are saved automatically.</li>
                  <li>Section B will appear immediately after Section A.</li>
                  <li>Section B is graded by your teacher. Your total score will be visible once they complete grading.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <Button size="lg" className="w-full text-base py-6" onClick={handleStartExam} disabled={submitting}>
          {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ClipboardCheck className="w-5 h-5 mr-2" />}
          Start Exam
        </Button>
      </div>
    );
  }

  // SECTION A
  if (examState === 'section_a') {
    const progressPct = (answeredCount / SECTION_A_QUESTIONS.length) * 100;
    const isLastPage = currentPage === totalPages - 1;

    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {/* Header bar */}
        <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-3 border-b gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Section A — Objectives</h2>
            <p className="text-xs text-muted-foreground">Page {currentPage + 1} of {totalPages} · {answeredCount}/50 answered</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono font-bold text-base ${timerWarning ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse' : 'bg-muted text-foreground'}`}>
            <Timer className="w-4 h-4" /> {formatTime(timeLeft)}
          </div>
        </div>

        <Progress value={progressPct} className="h-2" />

        {/* Questions */}
        <div className="space-y-5">
          {pageQuestions.map((q) => (
            <Card key={q.id} className={`transition-all ${sectionAAnswers[q.id] ? 'border-primary/40 bg-primary/5' : ''}`}>
              <CardContent className="pt-5 pb-4">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{q.id}</span>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1 font-medium">{q.section}</p>
                    <p className="text-sm font-medium text-foreground mb-4 leading-relaxed">{q.text}</p>
                    <div className="grid gap-2">
                      {q.options.map((opt) => {
                        const selected = sectionAAnswers[q.id] === opt.key;
                        return (
                          <button
                            key={opt.key}
                            onClick={() => handleSelectAnswer(q.id, opt.key)}
                            className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all flex items-start gap-3 ${selected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border hover:border-primary/50 hover:bg-accent/50'}`}
                          >
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${selected ? 'border-primary-foreground bg-primary-foreground text-primary' : 'border-current'}`}>{opt.key}</span>
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-2 pb-6">
          <Button variant="outline" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          {isLastPage ? (
            <Button onClick={handleSubmitSectionA} disabled={submitting} className="bg-green-600 hover:bg-green-700">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Submit Section A ({answeredCount}/50 answered)
            </Button>
          ) : (
            <Button onClick={() => setCurrentPage(p => p + 1)}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
        {error && <p className="text-red-500 text-sm text-center pb-4">{error}</p>}
      </div>
    );
  }

  // SECTION A COMPLETE → TRANSITION TO B
  if (examState === 'section_a_complete') {
    const score = exam?.sectionAScore ?? 0;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <div>
              <h3 className="text-2xl font-bold text-foreground">Section A Complete!</h3>
              <p className="text-muted-foreground mt-1">Your answers have been auto-graded.</p>
            </div>
            <div className="inline-flex items-center gap-3 bg-background rounded-xl px-8 py-4 border">
              <span className="text-4xl font-bold text-green-600">{score}</span>
              <span className="text-2xl text-muted-foreground">/ {SECTION_A_MAX}</span>
            </div>
            <p className="text-sm text-muted-foreground">Now proceed to Section B — theory questions graded by your teacher.</p>
          </CardContent>
        </Card>
        <Button size="lg" className="w-full py-6 text-base" onClick={() => setExamState('section_b')}>
          Continue to Section B <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    );
  }

  // SECTION B
  if (examState === 'section_b') {
    const q = SECTION_B_QUESTIONS[currentBQuestion];
    const allAnswered = sectionBAnswers.every(a => a.trim().length > 0);

    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-3 border-b gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Section B — Theory</h2>
            <p className="text-xs text-muted-foreground">Question {currentBQuestion + 1} of 10 · 3 marks each · 30 total</p>
          </div>
          <Badge variant="secondary" className="text-xs">{SECTION_B_QUESTIONS[currentBQuestion].book}</Badge>
        </div>

        <Progress value={((currentBQuestion + 1) / 10) * 100} className="h-2" />

        <Card>
          <CardContent className="pt-6 pb-5 space-y-4">
            <div className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-base">{currentBQuestion + 1}</span>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium mb-2">{q.book}</p>
                <p className="text-sm font-medium text-foreground leading-relaxed mb-4">{q.text}</p>
                <Textarea
                  value={sectionBAnswers[currentBQuestion]}
                  onChange={(e) => {
                    const updated = [...sectionBAnswers];
                    updated[currentBQuestion] = e.target.value;
                    setSectionBAnswers(updated);
                  }}
                  placeholder="Type your answer here..."
                  className="min-h-[150px] text-sm resize-y"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-2 pb-6">
          <Button variant="outline" onClick={() => setCurrentBQuestion(p => p - 1)} disabled={currentBQuestion === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          {currentBQuestion < 9 ? (
            <Button onClick={() => setCurrentBQuestion(p => p + 1)}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmitSectionB} disabled={submitting} className="bg-purple-600 hover:bg-purple-700">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Submit Exam {!allAnswered && '(some unanswered)'}
            </Button>
          )}
        </div>
        {/* Quick jump */}
        <div className="flex flex-wrap gap-2 pb-4">
          {SECTION_B_QUESTIONS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBQuestion(idx)}
              className={`w-8 h-8 rounded-full text-xs font-bold border transition-all ${currentBQuestion === idx ? 'bg-purple-600 text-white border-purple-600' : sectionBAnswers[idx]?.trim() ? 'bg-green-100 text-green-700 border-green-400 dark:bg-green-900 dark:text-green-300' : 'bg-muted text-muted-foreground border-border'}`}
            >{idx + 1}</button>
          ))}
        </div>
        {error && <p className="text-red-500 text-sm text-center pb-4">{error}</p>}
      </div>
    );
  }

  // AWAITING GRADING
  if (examState === 'awaiting') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Exam Submitted</h2>
          <p className="text-muted-foreground">Your exam has been submitted successfully.</p>
        </div>
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6 text-center space-y-4">
            <Clock className="w-16 h-16 text-amber-500 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-foreground">Awaiting Teacher Grading</h3>
              <p className="text-sm text-muted-foreground mt-1">Section B is being reviewed by your teacher. You'll be notified once grading is complete.</p>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-4">
          <Card className="text-center p-5">
            <p className="text-sm text-muted-foreground mb-1">Section A Score</p>
            <p className="text-3xl font-bold text-green-600">{exam?.sectionAScore ?? 0}<span className="text-lg text-muted-foreground">/{SECTION_A_MAX}</span></p>
            <p className="text-xs text-muted-foreground mt-1">Auto-graded</p>
          </Card>
          <Card className="text-center p-5 opacity-60">
            <p className="text-sm text-muted-foreground mb-1">Section B Score</p>
            <p className="text-3xl font-bold text-muted-foreground">—<span className="text-lg">/{SECTION_B_MAX}</span></p>
            <p className="text-xs text-amber-600 mt-1">Pending teacher review</p>
          </Card>
        </div>
      </div>
    );
  }

  // RESULTS
  if (examState === 'results') {
    const secA = exam?.sectionAScore ?? 0;
    const secB = exam?.sectionBScore ?? 0;
    const total = exam?.score ?? (secA + secB);
    const passed = total >= PASS_MARK;
    const pct = Math.round((total / TOTAL_MAX) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Your Results</h2>
          <p className="text-muted-foreground">2026 1st Quarter Foundation School Exam</p>
        </div>

        {/* Main result card */}
        <Card className={`border-2 ${passed ? 'border-green-400 bg-green-50 dark:bg-green-950/20' : 'border-red-400 bg-red-50 dark:bg-red-950/20'}`}>
          <CardContent className="pt-6 text-center space-y-4">
            {passed
              ? <Trophy className="w-20 h-20 text-green-500 mx-auto" />
              : <XCircle className="w-20 h-20 text-red-500 mx-auto" />}
            <div>
              <p className="text-5xl font-bold" style={{ color: passed ? 'var(--color-green-600, #16a34a)' : 'var(--color-red-600, #dc2626)' }}>{total}</p>
              <p className="text-lg text-muted-foreground">out of {TOTAL_MAX} ({pct}%)</p>
            </div>
            <Badge className={`text-sm px-4 py-1 ${passed ? 'bg-green-600' : 'bg-red-600'}`}>
              {passed ? '🎉 PASSED' : '❌ NOT PASSED'} · Pass mark: {PASS_MARK}/{TOTAL_MAX}
            </Badge>
          </CardContent>
        </Card>

        {/* Score breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="text-center p-5">
            <p className="text-sm text-muted-foreground mb-1">Section A</p>
            <p className="text-3xl font-bold text-blue-600">{secA}<span className="text-lg text-muted-foreground">/{SECTION_A_MAX}</span></p>
            <p className="text-xs text-muted-foreground mt-1">Objectives · Auto-graded</p>
          </Card>
          <Card className="text-center p-5">
            <p className="text-sm text-muted-foreground mb-1">Section B</p>
            <p className="text-3xl font-bold text-purple-600">{secB}<span className="text-lg text-muted-foreground">/{SECTION_B_MAX}</span></p>
            <p className="text-xs text-muted-foreground mt-1">Theory · Teacher graded</p>
          </Card>
        </div>
        <div className="space-y-2">
          <Progress value={(secA / SECTION_A_MAX) * 100} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Section A: {secA}/{SECTION_A_MAX}</span>
            <span>{Math.round((secA / SECTION_A_MAX) * 100)}%</span>
          </div>
          <Progress value={(secB / SECTION_B_MAX) * 100} className="h-3 [&>div]:bg-purple-500" />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Section B: {secB}/{SECTION_B_MAX}</span>
            <span>{Math.round((secB / SECTION_B_MAX) * 100)}%</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
