import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ClipboardList, Loader2, CheckCircle, Clock, User as UserIcon,
  ChevronDown, ChevronUp, Trophy, XCircle, AlertTriangle,
  RotateCcw, Search, Eye, FileText, Lock, Unlock
} from 'lucide-react';
import { supabaseDb } from '@/lib/supabase-db';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const SECTION_A_MAX = 50;
const SECTION_B_MAX = 30;
const TOTAL_MAX = 80;
const PASS_MARK = 64;

const SECTION_A_ANSWER_KEY: string[] = [
  'B','A','B','C','B','A','C',
  'C','B','C','B','A','A','A',
  'A','C','B','A','A','B',
  'C','B','A','A','A','A',
  'B','TRUE','B','B','B',
  'A','A','B','A','B',
  'B','B','A','B','A',
  'C','A','A','TRUE','A','A','B','A','C',
];

const SECTION_A_QUESTIONS_SHORT = [
  'What part of man receives eternal life at the new birth?',
  '"As a new creature, you belong to the family of God..." is:',
  'According to Romans 10:9, what brings a person salvation?',
  'Through the Lordship of Love, you will understand ___',
  'What does submitting to the Lordship of the Spirit involve?',
  'Renewing your mind instruction is primarily found in:',
  'Which does NOT represent the new creature in Christ?',
  'When does the baptism of the Holy Spirit occur?',
  'The Infilling of the Holy Spirit is also known as:',
  'The Holy Spirit is best described as:',
  'First reference to the Holy Spirit is in:',
  'Which is NOT a dimension of the Holy Spirit?',
  'Primary ministry of the Holy Spirit is to:',
  'When you speak in tongues you _____ yourselves (1 Cor 14:4)',
  'A Doctrine is:',
  'The Bible is described as (2 Tim 3:16):',
  'Why is the spiritual Kingdom superior to the physical?',
  'Why are doctrines important in Christianity?',
  'What does the Doctrine of Righteousness reveal?',
  'What is LW Expansionism?',
  'Evangelism is reaching someone with the intention that it:',
  'Soul saving vs soul winning distinction highlights:',
  'Acts 1:8 — what enables effective witnessing?',
  'First step to perfecting soul winning:',
  'Why explain the Gospel, not just preach it?',
  'What to do after leading someone to Christ:',
  'Primary purpose of Cell Ministry:',
  'Cell Ministry ensures no member is left behind. TRUE/FALSE',
  'What makes Cell Ministry effective across Loveworld?',
  'How often does the Cell meet?',
  'How are members assigned to a Cell?',
  'Spiritual Growth can be seen in quality of:',
  'Difference between salvation and spiritual growth:',
  'How does walking in the Spirit help character growth?',
  'Fundamental principle of prosperity (Luke 6:38):',
  'Significance of "Partnership Seeds" in giving:',
  'Church (Ecclesia) means:',
  'The Universal Church is:',
  'Why must every Christian be part of a Local Assembly?',
  'Most important responsibility as a Local Assembly member:',
  'In Christ Embassy we believe in the _____ of the church:',
  'Technology is the sum of techniques, skills and processes for:',
  'Technology that goes where the user goes is:',
  'Crucial roles technology plays in evangelism EXCEPT:',
  'All members should know Ministry Technology Platforms. TRUE/FALSE',
  'Benefit of Soultracker App:',
  'Designated prayer times for Pastor Chris Live:',
  '_____ is an online replica of the Foundation School:',
  '_____ is a repository of FS Student testimonies:',
  '_____ lets you create healing centers and partner in healing streams:',
];

const SECTION_B_QUESTION_TEXTS = [
  'According to "Now That You Are Born Again" — what does it mean to be born again?',
  'How is salvation primarily received?',
  "The fact that you are a New Creature inside doesn't mean you'll look different outwardly. Discuss.",
  'What does "The Seven Spirits of God" represent?',
  'Which scripture introduces us to the Seven Spirits of God?',
  'The Spirit of the Lord signifies:',
  '"Wisdom is the principal thing… get wisdom: and with all thy getting get ___"',
  'Role of faith in "joining the chariot":',
  'Ultimate promise for those who "join the chariot":',
  "Joseph's purpose in Egypt (Genesis 45:1-5):",
];

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface ExamRecord {
  id: string;
  studentId: string;
  sectionAAnswers: Record<string, string> | null;
  sectionAScore: number;
  sectionBAnswers: string[] | null;
  sectionBScore: number | null;
  score: number | null;
  status: string;
  completedAt: string | null;
  startedAt: string | null;
  student: { id: string; name: string; email: string; church?: string; fellowship?: string; cell?: string } | null;
}

interface AdminExamManagementProps {
  adminId?: string;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export const AdminExamManagement = ({ adminId: _adminId }: AdminExamManagementProps) => {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<Record<string, 'overview' | 'section_a' | 'section_b' | 'grade'>>({});
  const [scores, setScores] = useState<Record<string, number[]>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [annulling, setAnnulling] = useState<string | null>(null);
  const [error, setError] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('all');
  const [examLocked, setExamLocked] = useState(true);
  const [togglingLock, setTogglingLock] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await supabaseDb.getAllExamsForAdmin();
      const lockedState = await supabaseDb.getExamLocked();
      setExamLocked(lockedState);
      setExams(data as ExamRecord[]);
      const initScores: Record<string, number[]> = {};
      data.forEach((e: any) => {
        if (e.status === 'section_b_submitted' || e.status === 'fully_graded') {
          initScores[e.id] = Array(10).fill(0);
        }
      });
      setScores(initScores);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleLock = async () => {
    setTogglingLock(true);
    try {
      const newState = !examLocked;
      await supabaseDb.setExamLocked(newState);
      setExamLocked(newState);
    } catch (e) {
      console.error('Failed to toggle exam lock:', e);
    } finally {
      setTogglingLock(false);
    }
  };

  const filtered = exams.filter(e => {
    const name = e.student?.name?.toLowerCase() ?? '';
    const email = e.student?.email?.toLowerCase() ?? '';
    const church = e.student?.church?.toLowerCase() ?? '';
    const q = search.toLowerCase();
    const matchesSearch = !q || name.includes(q) || email.includes(q) || church.includes(q);
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'pending' && e.status === 'section_b_submitted') ||
      (activeTab === 'graded' && e.status === 'fully_graded') ||
      (activeTab === 'section_a_only' && e.status === 'section_a_complete');
    return matchesSearch && matchesTab;
  });

  const pending = exams.filter(e => e.status === 'section_b_submitted').length;
  const graded = exams.filter(e => e.status === 'fully_graded').length;

  const getMode = (id: string) => viewMode[id] ?? 'overview';
  const setMode = (id: string, mode: 'overview' | 'section_a' | 'section_b' | 'grade') =>
    setViewMode(prev => ({ ...prev, [id]: mode }));

  const totalBScore = (examId: string) =>
    (scores[examId] || []).reduce((s, v) => s + (Number(v) || 0), 0);

  const handleScoreChange = (examId: string, qIdx: number, value: string) => {
    const num = Math.min(3, Math.max(0, Number(value) || 0));
    setScores(prev => {
      const arr = [...(prev[examId] || Array(10).fill(0))];
      arr[qIdx] = num;
      return { ...prev, [examId]: arr };
    });
  };

  const handleSubmitGrade = async (exam: ExamRecord) => {
    const sectionBScore = totalBScore(exam.id);
    setSubmitting(exam.id);
    setError(prev => ({ ...prev, [exam.id]: '' }));
    setSuccess(prev => ({ ...prev, [exam.id]: '' }));
    try {
      await supabaseDb.gradeSectionB(exam.id, sectionBScore, exam.sectionAScore);
      setSuccess(prev => ({ ...prev, [exam.id]: `Graded! Section B: ${sectionBScore}/${SECTION_B_MAX} · Total: ${exam.sectionAScore + sectionBScore}/${TOTAL_MAX}` }));
      await load();
      setMode(exam.id, 'overview');
    } catch {
      setError(prev => ({ ...prev, [exam.id]: 'Failed to submit grade. Please try again.' }));
    } finally {
      setSubmitting(null);
    }
  };

  const handleAnnul = async (exam: ExamRecord) => {
    if (!window.confirm(`Annul Section B grading for ${exam.student?.name}? This will reset their Section B score and allow regrading.`)) return;
    setAnnulling(exam.id);
    setError(prev => ({ ...prev, [exam.id]: '' }));
    try {
      await supabaseDb.annulSectionB(exam.id);
      await load();
      setMode(exam.id, 'grade');
    } catch {
      setError(prev => ({ ...prev, [exam.id]: 'Failed to annul grading.' }));
    } finally {
      setAnnulling(null);
    }
  };

  // Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'fully_graded') return <Badge className="bg-green-600 text-xs">Graded</Badge>;
    if (status === 'section_b_submitted') return <Badge className="bg-amber-500 text-xs">Pending</Badge>;
    if (status === 'section_a_complete') return <Badge className="bg-blue-500 text-xs">Sec A only</Badge>;
    return <Badge variant="outline" className="text-xs">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Exam Management</h2>
          <p className="text-muted-foreground">View all student exam submissions, grade papers, and manage results</p>
        </div>
        <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg border">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Student Access</span>
            <span className="text-xs text-muted-foreground">{examLocked ? 'Currently locked' : 'Currently open'}</span>
          </div>
          <Button
            variant={examLocked ? 'default' : 'destructive'}
            onClick={handleToggleLock}
            disabled={togglingLock}
            className="w-32"
          >
            {togglingLock ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : examLocked ? (
              <Unlock className="w-4 h-4 mr-2" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            {examLocked ? 'Unlock Exam' : 'Lock Exam'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Submissions', value: exams.length, icon: ClipboardList, color: 'blue' },
          { label: 'Pending Grading', value: pending, icon: Clock, color: 'amber' },
          { label: 'Fully Graded', value: graded, icon: CheckCircle, color: 'green' },
          { label: 'Sec A Only', value: exams.filter(e => e.status === 'section_a_complete').length, icon: FileText, color: 'purple' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
                <Icon className={`w-5 h-5 text-${color}-600`} />
              </div>
              <div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, email, or church..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({exams.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending {pending > 0 && <Badge className="ml-1.5 bg-amber-500 text-white text-[10px] py-0 px-1.5">{pending}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="graded">Graded ({graded})</TabsTrigger>
          <TabsTrigger value="section_a_only">Sec A only</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3 mt-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No submissions found.</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map(exam => {
              const isExpanded = expandedId === exam.id;
              const mode = getMode(exam.id);
              const total = exam.score ?? 0;
              const passed = total >= PASS_MARK;
              const canGrade = exam.status === 'section_b_submitted';
              const isGraded = exam.status === 'fully_graded';

              return (
                <Card key={exam.id} className={`transition-all ${isExpanded ? 'ring-1 ring-primary/30' : ''}`}>
                  {/* ── Row header ── */}
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 font-bold text-sm">
                          {exam.student?.name?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{exam.student?.name ?? 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground truncate">{exam.student?.email} · {exam.student?.church}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={exam.status} />
                        <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                          Sec A: <strong className="text-blue-600">{exam.sectionAScore}/{SECTION_A_MAX}</strong>
                        </span>
                        {isGraded && (
                          <>
                            <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                              Sec B: <strong className="text-purple-600">{exam.sectionBScore}/{SECTION_B_MAX}</strong>
                            </span>
                            <span className="text-sm font-bold">
                              {total}/{TOTAL_MAX}
                              {' '}{passed
                                ? <span className="text-green-600 text-xs">(PASS)</span>
                                : <span className="text-red-500 text-xs">(FAIL)</span>}
                            </span>
                          </>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => {
                          setExpandedId(isExpanded ? null : exam.id);
                          if (!isExpanded) setMode(exam.id, 'overview');
                        }}>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* ── Expanded body ── */}
                  {isExpanded && (
                    <CardContent className="pt-0 border-t space-y-4">
                      {/* Sub-nav */}
                      <div className="flex gap-2 flex-wrap pt-3">
                        <Button size="sm" variant={mode === 'overview' ? 'default' : 'outline'} onClick={() => setMode(exam.id, 'overview')}>
                          <Eye className="w-3 h-3 mr-1.5" /> Overview
                        </Button>
                        <Button size="sm" variant={mode === 'section_a' ? 'default' : 'outline'} onClick={() => setMode(exam.id, 'section_a')}>
                          <FileText className="w-3 h-3 mr-1.5" /> Section A Answers
                        </Button>
                        {(canGrade || isGraded) && (
                          <Button size="sm" variant={mode === 'section_b' ? 'default' : 'outline'} onClick={() => setMode(exam.id, 'section_b')}>
                            <FileText className="w-3 h-3 mr-1.5" /> Section B Answers
                          </Button>
                        )}
                        {(canGrade || isGraded) && (
                          <Button
                            size="sm"
                            variant={mode === 'grade' ? 'default' : 'outline'}
                            onClick={() => {
                              setMode(exam.id, 'grade');
                              // Pre-fill existing scores if regrading
                              if (isGraded && exam.sectionBScore != null) {
                                // distribute evenly as a starting point for regrading
                                const perQ = Math.floor(exam.sectionBScore / 10);
                                const rem = exam.sectionBScore % 10;
                                const arr = Array(10).fill(perQ);
                                for (let i = 0; i < rem; i++) arr[i] = Math.min(3, arr[i] + 1);
                                setScores(prev => ({ ...prev, [exam.id]: arr }));
                              }
                            }}
                            className={canGrade ? 'bg-amber-500 hover:bg-amber-600 text-white border-0' : ''}
                          >
                            <ClipboardList className="w-3 h-3 mr-1.5" />
                            {isGraded ? 'Regrade / Annul' : 'Grade Section B'}
                          </Button>
                        )}
                      </div>

                      {/* ── OVERVIEW mode ── */}
                      {mode === 'overview' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { label: 'Church', value: exam.student?.church ?? '—' },
                              { label: 'Fellowship', value: exam.student?.fellowship ?? '—' },
                              { label: 'Started', value: exam.startedAt ? new Date(exam.startedAt).toLocaleString() : '—' },
                              { label: 'Submitted', value: exam.completedAt ? new Date(exam.completedAt).toLocaleString() : '—' },
                            ].map(({ label, value }) => (
                              <div key={label} className="bg-muted/40 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground">{label}</p>
                                <p className="text-sm font-medium mt-0.5 truncate">{value}</p>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-4 border rounded-lg">
                              <p className="text-xs text-muted-foreground">Section A</p>
                              <p className="text-2xl font-bold text-blue-600">{exam.sectionAScore}<span className="text-base text-muted-foreground">/{SECTION_A_MAX}</span></p>
                              <p className="text-xs text-muted-foreground">Auto-graded</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                              <p className="text-xs text-muted-foreground">Section B</p>
                              <p className="text-2xl font-bold text-purple-600">
                                {exam.sectionBScore != null ? exam.sectionBScore : '—'}
                                <span className="text-base text-muted-foreground">/{SECTION_B_MAX}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">{isGraded ? 'Teacher graded' : 'Pending'}</p>
                            </div>
                            <div className={`text-center p-4 border-2 rounded-lg ${isGraded ? (passed ? 'border-green-400' : 'border-red-400') : 'border-border'}`}>
                              <p className="text-xs text-muted-foreground">Total</p>
                              <p className={`text-2xl font-bold ${isGraded ? (passed ? 'text-green-600' : 'text-red-500') : 'text-muted-foreground'}`}>
                                {isGraded ? total : '—'}<span className="text-base text-muted-foreground">/{TOTAL_MAX}</span>
                              </p>
                              {isGraded && (
                                <p className={`text-xs font-bold ${passed ? 'text-green-600' : 'text-red-500'}`}>
                                  {passed ? '✓ PASS' : '✗ FAIL'}
                                </p>
                              )}
                            </div>
                          </div>
                          {success[exam.id] && (
                            <p className="text-green-600 text-sm bg-green-50 dark:bg-green-950/30 p-2 rounded-lg">{success[exam.id]}</p>
                          )}
                        </div>
                      )}

                      {/* ── SECTION A ANSWERS mode ── */}
                      {mode === 'section_a' && (
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Section A — Student Answers vs Answer Key</p>
                          <div className="grid gap-1.5">
                            {SECTION_A_ANSWER_KEY.map((correct, idx) => {
                              const qNum = idx + 1;
                              const studentAns = exam.sectionAAnswers?.[qNum] ?? '—';
                              const isCorrect = studentAns === correct;
                              return (
                                <div key={qNum} className={`flex items-start gap-3 p-2.5 rounded-lg text-sm ${isCorrect ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
                                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCorrect ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>{qNum}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground leading-snug">{SECTION_A_QUESTIONS_SHORT[idx]}</p>
                                  </div>
                                  <div className="flex gap-2 flex-shrink-0 text-xs font-bold">
                                    <span className={isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                      {studentAns}
                                    </span>
                                    {!isCorrect && <span className="text-muted-foreground">→ {correct}</span>}
                                    {isCorrect ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-500" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="sticky bottom-0 bg-background pt-2 border-t flex justify-between text-sm font-medium">
                            <span className="text-green-600">{exam.sectionAScore} correct</span>
                            <span className="text-red-500">{SECTION_A_MAX - exam.sectionAScore} wrong</span>
                            <span className="font-bold">Score: {exam.sectionAScore}/{SECTION_A_MAX}</span>
                          </div>
                        </div>
                      )}

                      {/* ── SECTION B ANSWERS mode ── */}
                      {mode === 'section_b' && (
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Section B — Student Theory Answers</p>
                          {SECTION_B_QUESTION_TEXTS.map((qText, idx) => (
                            <div key={idx} className="border rounded-lg p-4 space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground">Q{idx + 1}. {qText}</p>
                              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-muted/40 rounded p-2 min-h-[40px]">
                                {exam.sectionBAnswers?.[idx]?.trim() || <span className="italic text-muted-foreground">No answer provided</span>}
                              </p>
                              {isGraded && (
                                <p className="text-xs text-right text-purple-600 font-semibold">
                                  Score given: {scores[exam.id]?.[idx] ?? '?'}/3
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── GRADE / REGRADE mode ── */}
                      {mode === 'grade' && (
                        <div className="space-y-4">
                          {isGraded && (
                            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              <div className="flex-1 text-sm text-amber-800 dark:text-amber-200">
                                This exam is already graded (Section B: <strong>{exam.sectionBScore}/{SECTION_B_MAX}</strong>).
                                To regrade, first annul the existing grade.
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-amber-400 text-amber-700 hover:bg-amber-100 dark:text-amber-300"
                                onClick={() => handleAnnul(exam)}
                                disabled={annulling === exam.id}
                              >
                                {annulling === exam.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RotateCcw className="w-3 h-3 mr-1" />}
                                Annul & Regrade
                              </Button>
                            </div>
                          )}

                          {(!isGraded || exam.status === 'section_b_submitted') && (
                            <>
                              <div className="flex items-center justify-between text-sm">
                                <p className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Grade each Section B answer (0–3)</p>
                                <span className="text-purple-600 font-bold">Running total: {totalBScore(exam.id)}/{SECTION_B_MAX}</span>
                              </div>
                              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                                {SECTION_B_QUESTION_TEXTS.map((qText, idx) => (
                                  <div key={idx} className="border rounded-lg p-4 space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground">Q{idx + 1}. {qText}</p>
                                    <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/40 rounded p-2 min-h-[40px]">
                                      {exam.sectionBAnswers?.[idx]?.trim() || <span className="italic text-muted-foreground">No answer provided</span>}
                                    </p>
                                    <div className="flex items-center justify-end gap-2">
                                      <span className="text-xs text-muted-foreground">Score (0–3):</span>
                                      <Input
                                        type="number" min={0} max={3}
                                        value={scores[exam.id]?.[idx] ?? 0}
                                        onChange={e => handleScoreChange(exam.id, idx, e.target.value)}
                                        className="w-16 text-center font-bold"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg sticky bottom-0">
                                <div>
                                  <p className="text-sm font-semibold">Final Score Preview</p>
                                  <p className="text-xs text-muted-foreground">
                                    {exam.sectionAScore} + {totalBScore(exam.id)} = <strong>{exam.sectionAScore + totalBScore(exam.id)}/{TOTAL_MAX}</strong>
                                    {' '}·{' '}
                                    {exam.sectionAScore + totalBScore(exam.id) >= PASS_MARK
                                      ? <span className="text-green-600 font-semibold">PASS</span>
                                      : <span className="text-red-600 font-semibold">FAIL</span>}
                                  </p>
                                </div>
                                <Button
                                  onClick={() => handleSubmitGrade(exam)}
                                  disabled={submitting === exam.id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {submitting === exam.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                  Finalise Grade
                                </Button>
                              </div>
                            </>
                          )}
                          {error[exam.id] && <p className="text-red-500 text-sm">{error[exam.id]}</p>}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
