import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, MessageSquare, Brain, Users, Target, Church } from 'lucide-react';

interface ClassAssignmentProps {
  classId: string;
  className: string;
}

const ASSIGNMENTS = {
  'class-1': {
    title: 'Assignment for Class 1',
    questions: [
      'Explain your understanding of "if any man be in Christ he is a new creation" as stated in 2 Cor 5:17 using yourself as an example.',
      'Will I be continually assured of my salvation despite what I feel or see?'
    ],
    studyMaterial: {
      title: 'STUDY MATERIAL BEFORE CLASS 2',
      books: [
        'Now That You Are Born Again',
        'Recreating Your World'
      ],
      messages: [
        'Jesus',
        'The Overcoming Life'
      ],
      memoryVerse: '2 Cor 5:17'
    }
  },
  'class-2': {
    title: 'Assignment for Class 2',
    tasks: [
      'Read the Book "The Seven Spirits of God"',
      'Speak in Tongues for at least 10 Minutes each Day till the next class. Note observations or changes you notice about yourself, or specific thoughts or direction that you received as you prayed.'
    ]
  },
  'class-3': {
    title: 'ASSIGNMENT for Class 3',
    tasks: [
      'Listen to the following Messages:',
      '• Understanding Righteousness',
      '• 3 Important Laws', 
      '• Apologetics vs Activism',
      'Write 3 Striking things you learned and which you will put to work, from each message.'
    ]
  },
  'class-4a': {
    title: 'ASSIGNMENT for Class 4A',
    tasks: [
      'Read the explanations of the Seven Steps to Perfecting Soulwinning',
      'Get your Personal Copy of "Join This Chariot" Read it, and answer the questions at end of each Chapter (in the Book), and bring your completed Book to the class next week.',
      'Reach out to 2 people and bring them to church next week. Submit their names at the next class. Note any challenge or testimony you encountered, and share with us.'
    ]
  },
  'class-5': {
    title: 'ASSIGNMENT FOR CLASS 5',
    tasks: [
      'Get Your Personal Copy of the Book "Power of Your Mind" and read it. Discuss 2 striking thoughts you received as you studied the Book and submit. It should be at least 1 page long.',
      'Download from PCDL and listen to "Topical Teaching Highlights on Christian Growth and Maturity"',
      'Listen to the Message "Tithes and Offerings". Sign up for at least one Partnership Arm.'
    ]
  },
  'class-6': {
    title: 'ASSIGNMENT FOR CLASS 6',
    tasks: [
      'Special Study on "Why We Must Go To Church" and provide answers to the questions in the Pamphlet.',
      'Listen to the Special Message "The Church, Yesterday, Today and Forever"'
    ]
  }
};

export const ClassAssignment = ({ classId, className }: ClassAssignmentProps) => {
  // Get assignment based on class name
  const getAssignmentKey = (className: string) => {
    const name = className.toLowerCase();
    if (name.includes('class 1') || name.includes('foundation class 1')) return 'class-1';
    if (name.includes('class 2') || name.includes('foundation class 2')) return 'class-2';
    if (name.includes('class 3') || name.includes('foundation class 3')) return 'class-3';
    if (name.includes('class 4a') || name.includes('foundation class 4a')) return 'class-4a';
    if (name.includes('class 5') || name.includes('foundation class 5')) return 'class-5';
    if (name.includes('class 6') || name.includes('foundation class 6')) return 'class-6';
    return null;
  };

  const assignmentKey = getAssignmentKey(className);
  const assignment = assignmentKey ? ASSIGNMENTS[assignmentKey as keyof typeof ASSIGNMENTS] : null;

  if (!assignment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assignment</CardTitle>
          <CardDescription>No assignment available for this class</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <CardTitle className="text-xl text-primary">{assignment.title}</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Complete these assignments before the next class
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Questions Section */}
        {assignment.questions && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h4 className="font-semibold text-blue-600">Questions to Answer</h4>
            </div>
            <div className="space-y-2 pl-6">
              {assignment.questions.map((question, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 text-xs">
                    {index + 1}
                  </Badge>
                  <p className="text-sm text-foreground leading-relaxed">{question}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Section */}
        {assignment.tasks && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              <h4 className="font-semibold text-green-600">Tasks to Complete</h4>
            </div>
            <div className="space-y-2 pl-6">
              {assignment.tasks.map((task, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 text-xs">
                    {index + 1}
                  </Badge>
                  <p className="text-sm text-foreground leading-relaxed">{task}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study Material Section */}
        {assignment.studyMaterial && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <h4 className="font-semibold text-purple-600">{assignment.studyMaterial.title}</h4>
            </div>
            
            {/* Books */}
            {assignment.studyMaterial.books && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-orange-600" />
                  <h5 className="font-medium text-orange-600">BOOKS</h5>
                </div>
                <ul className="pl-6 space-y-1">
                  {assignment.studyMaterial.books.map((book, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{book}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Messages */}
            {assignment.studyMaterial.messages && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <h5 className="font-medium text-blue-600">MESSAGES</h5>
                </div>
                <ul className="pl-6 space-y-1">
                  {assignment.studyMaterial.messages.map((message, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Memory Verse */}
            {assignment.studyMaterial.memoryVerse && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Church className="w-4 h-4 text-red-600" />
                  <h5 className="font-medium text-red-600">MEMORY VERSE</h5>
                </div>
                <div className="pl-6">
                  <Badge variant="secondary" className="text-sm font-mono">
                    {assignment.studyMaterial.memoryVerse}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completion Note */}
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-xs text-primary font-medium text-center">
            📝 Complete all assignments and bring your work to the next class
          </p>
        </div>
      </CardContent>
    </Card>
  );
};






























