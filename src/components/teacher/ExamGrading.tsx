import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ClipboardList, Loader2, CheckCircle, Clock, User as UserIcon,
  ChevronDown, ChevronUp, Trophy, XCircle
} from 'lucide-react';
import { supabaseDb } from '@/lib/supabase-db';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const SECTION_A_MAX = 50;
const SECTION_B_MAX = 30;
const TOTAL_MAX = 80;
const PASS_MARK = 64;
const QUESTIONS_PER_SECTION_B = 10;

const SECTION_B_QUESTION_TEXTS = [
  'According to the Book "Now That You Are Born Again" — what does it mean to be born again?',
  'How is salvation primarily received?',
  "The fact that you are a New Creature inside doesn't mean that outwardly you'll look different. Discuss.",
  'What does the term "The Seven Spirits of God" represent according to the book "The Seven Spirits of God"?',
  'Which scripture reference introduces us to the Seven Spirits of God?',
  'According to the book, the Spirit of the Lord signifies:',
  'Complete the following statement: "Wisdom is the principal thing; therefore, get wisdom: and with all thy getting get ________"',
  'Which of the following best captures the role of faith in the process of "joining the chariot"?',
  'What is the ultimate promise for those who "join the chariot" as highlighted in the book?',
  "What was Joseph's purpose in Egypt according to Genesis 45:1-5?",
];

interface ExamGradingProps {
  teacherId: string;
}

interface ExamRecord {
  id: string;
  studentId: string;
  sectionAScore: number;
  sectionBAnswers: string[];
  sectionBScore: number | null;
  score: number | null;
  status: string;
  completedAt: string | null;
  student: { id: string; name: string; email: string; church?: string; fellowship?: string } | null;
}

export const ExamGrading = ({ teacherId }: ExamGradingProps) => {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number[]>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await supabaseDb.getPendingExamsForTeacher(teacherId);
      setExams(data as ExamRecord[]);
      // Initialise score arrays for each pending exam
      const initial: Record<string, number[]> = {};
      data.forEach((e: any) => {
        if (e.status === 'section_b_submitted') {
          initial[e.id] = Array(QUESTIONS_PER_SECTION_B).fill(0);
        }
      });
      setScores(initial);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [teacherId]);

  const totalScoreForExam = (examId: string) =>
    (scores[examId] || []).reduce((sum, v) => sum + (Number(v) || 0), 0);

  const handleScoreChange = (examId: string, qIdx: number, value: string) => {
    const num = Math.min(3, Math.max(0, Number(value) || 0));
    setScores(prev => {
      const arr = [...(prev[examId] || Array(QUESTIONS_PER_SECTION_B).fill(0))];
      arr[qIdx] = num;
      return { ...prev, [examId]: arr };
    });
  };

  const handleSubmitGrade = async (exam: ExamRecord) => {
    const sectionBScore = totalScoreForExam(exam.id);
    setSubmitting(exam.id);
    setError(prev => ({ ...prev, [exam.id]: '' }));
    try {
      await supabaseDb.gradeSectionB(exam.id, sectionBScore, exam.sectionAScore);
      await load(); // reload
      setExpandedId(null);
    } catch {
      setError(prev => ({ ...prev, [exam.id]: 'Failed to submit grade. Please try again.' }));
    } finally {
      setSubmitting(null);
    }
  };

  const pending = exams.filter(e => e.status === 'section_b_submitted');
  const graded = exams.filter(e => e.status === 'fully_graded');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Exam Grading</h2>
        <p className="text-muted-foreground">Review and grade student Section B exam answers</p>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pending.length}</p>
              <p className="text-sm text-muted-foreground">Pending Grading</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{graded.length}</p>
              <p className="text-sm text-muted-foreground">Graded</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{exams.length}</p>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="pending">
            Pending {pending.length > 0 && <Badge className="ml-2 bg-amber-500 text-white text-xs py-0 px-1.5">{pending.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
        </TabsList>

        {/* PENDING TAB */}
        <TabsContent value="pending" className="space-y-4 mt-4">
          {pending.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No submissions pending grading.</p>
              </CardContent>
            </Card>
          ) : (
            pending.map(exam => {
              const isExpanded = expandedId === exam.id;
              const totalBScore = totalScoreForExam(exam.id);

              return (
                <Card key={exam.id} className="border-amber-200 dark:border-amber-800">
                  {/* Header row */}
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{exam.student?.name ?? 'Unknown'}</CardTitle>
                          <CardDescription className="text-xs">{exam.student?.email} · {exam.student?.church}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">Section A</p>
                          <p className="font-bold text-blue-600">{exam.sectionAScore}/{SECTION_A_MAX}</p>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/50 dark:text-amber-300">Pending</Badge>
                        <Button variant="ghost" size="icon" onClick={() => setExpandedId(isExpanded ? null : exam.id)}>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0 space-y-4 border-t">
                      <div className="flex gap-4 pt-3 text-sm">
                        <span className="text-muted-foreground">Section A Score: <strong className="text-foreground">{exam.sectionAScore}/{SECTION_A_MAX}</strong></span>
                        <span className="text-muted-foreground">Section B Running Total: <strong className="text-purple-600">{totalBScore}/{SECTION_B_MAX}</strong></span>
                      </div>

                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Section B Answers — Grade each 0–3</p>

                      <div className="space-y-4">
                        {SECTION_B_QUESTION_TEXTS.map((qText, idx) => {
                          const answer = exam.sectionBAnswers?.[idx] ?? '';
                          const qScore = scores[exam.id]?.[idx] ?? 0;
                          return (
                            <div key={idx} className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-muted-foreground mb-1">Q{idx + 1}. {qText}</p>
                                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted/50 rounded p-2 min-h-[48px]">
                                    {answer.trim() || <span className="text-muted-foreground italic">No answer provided</span>}
                                  </p>
                                </div>
                                <div className="flex-shrink-0 text-right">
                                  <p className="text-xs text-muted-foreground mb-1">Score (0–3)</p>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={3}
                                    value={qScore}
                                    onChange={(e) => handleScoreChange(exam.id, idx, e.target.value)}
                                    className="w-16 text-center font-bold"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Grade summary */}
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">Final Score Preview</p>
                          <p className="text-xs text-muted-foreground">
                            Section A ({exam.sectionAScore}) + Section B ({totalBScore}) = <strong>{exam.sectionAScore + totalBScore}/{TOTAL_MAX}</strong>
                            {' '}· {exam.sectionAScore + totalBScore >= PASS_MARK ? <span className="text-green-600 font-semibold">PASS</span> : <span className="text-red-600 font-semibold">FAIL</span>}
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
                      {error[exam.id] && <p className="text-red-500 text-sm">{error[exam.id]}</p>}
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* GRADED TAB */}
        <TabsContent value="graded" className="space-y-4 mt-4">
          {graded.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No graded exams yet.</p>
              </CardContent>
            </Card>
          ) : (
            graded.map(exam => {
              const total = exam.score ?? 0;
              const passed = total >= PASS_MARK;
              return (
                <Card key={exam.id} className={`border ${passed ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${passed ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                          {passed ? <Trophy className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-500" />}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{exam.student?.name ?? 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{exam.student?.church}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Sec A</p>
                          <p className="font-bold text-blue-600">{exam.sectionAScore}/{SECTION_A_MAX}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Sec B</p>
                          <p className="font-bold text-purple-600">{exam.sectionBScore}/{SECTION_B_MAX}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-lg font-bold">{total}/{TOTAL_MAX}</p>
                        </div>
                        <Badge className={passed ? 'bg-green-600' : 'bg-red-600'}>
                          {passed ? 'PASSED' : 'FAILED'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
