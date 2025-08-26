// mockApi.js

export async function fetchExams({ page = 1, limit = 10 }) {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 300));
  return {
    status: 'SUCCESS',
    responseMsg: 'EXAMS_FETCHED',
    payload: {
      total: 6,
      page,
      limit,
      totalPages: 1,
      exams: [
        {
          id: '1',
          title: 'JavaScript Fundamentals',
          type: 'QUIZ',
          active: true,
          created_at: Date.now(),
        },
        {
          id: '2',
          title: 'React Basics',
          type: 'QUIZ',
          active: true,
          created_at: Date.now(),
        },
        {
          id: '3',
          title: 'Data Structures',
          type: 'TEST',
          active: true,
          created_at: Date.now(),
        },
        {
          id: '4',
          title: 'Web Development',
          type: 'QUIZ',
          active: true,
          created_at: Date.now(),
        },
        {
          id: '5',
          title: 'Database Design',
          type: 'QUIZ',
          active: true,
          created_at: Date.now(),
        },
        {
          id: '6',
          title: 'System Design',
          type: 'TEST',
          active: true,
          created_at: Date.now(),
        },
      ],
    },
  };
}

export async function fetchQuestions({ examId, page = 1, limit = 10 }) {
  await new Promise((res) => setTimeout(res, 300));

  const questionsByExam = {
    1: [
      // JavaScript Fundamentals
      {
        id: 'js1',
        question_text: 'What is the output of: console.log(typeof [])?',
        type: 'MCQ',
        metadata: {
          options: ['array', 'object', 'undefined', 'null'],
          correct: 1,
        },
      },
      {
        id: 'js2',
        question_text:
          'Which method is used to add elements at the end of an array?',
        type: 'MCQ',
        metadata: {
          options: ['push()', 'pop()', 'shift()', 'unshift()'],
          correct: 0,
        },
      },
      {
        id: 'js3',
        question_text: 'What is closure in JavaScript?',
        type: 'MCQ',
        metadata: {
          options: [
            'A function with access to outer scope',
            'A method to close browser window',
            'A way to end loops',
            'A type of variable',
          ],
          correct: 0,
        },
      },
      {
        id: 'js4',
        question_text: 'What is the purpose of "use strict"?',
        type: 'MCQ',
        metadata: {
          options: [
            'Enables strict mode',
            'Imports modules',
            'Declares variables',
            'Creates objects',
          ],
          correct: 0,
        },
      },
      {
        id: 'js5',
        question_text: 'Which operator is used for strict equality?',
        type: 'MCQ',
        metadata: {
          options: ['==', '===', '=', '!='],
          correct: 1,
        },
      },
    ],
    2: [
      // React Basics
      {
        id: 'react1',
        question_text: 'What is JSX?',
        type: 'MCQ',
        metadata: {
          options: [
            'JavaScript XML',
            'JavaScript Extension',
            'Java Syntax',
            'JSON XML',
          ],
          correct: 0,
        },
      },
      {
        id: 'react2',
        question_text: 'What hook is used for side effects?',
        type: 'MCQ',
        metadata: {
          options: ['useState', 'useEffect', 'useContext', 'useReducer'],
          correct: 1,
        },
      },
      {
        id: 'react3',
        question_text: 'What is the virtual DOM?',
        type: 'MCQ',
        metadata: {
          options: [
            'A lightweight copy of the actual DOM',
            'A browser feature',
            'A CSS framework',
            'A JavaScript library',
          ],
          correct: 0,
        },
      },
      {
        id: 'react4',
        question_text: 'Which method is used to prevent form submission?',
        type: 'MCQ',
        metadata: {
          options: [
            'preventDefault()',
            'stopPropagation()',
            'stopSubmit()',
            'cancelSubmit()',
          ],
          correct: 0,
        },
      },
      {
        id: 'react5',
        question_text: 'What is a React component?',
        type: 'MCQ',
        metadata: {
          options: [
            'A reusable UI piece',
            'A database table',
            'A styling framework',
            'A testing tool',
          ],
          correct: 0,
        },
      },
    ],
    3: [
      // Data Structures
      {
        id: 'ds1',
        question_text: 'What is the time complexity of binary search?',
        type: 'MCQ',
        metadata: {
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
          correct: 1,
        },
      },
      {
        id: 'ds2',
        question_text: 'Which data structure uses LIFO principle?',
        type: 'MCQ',
        metadata: {
          options: ['Queue', 'Stack', 'Linked List', 'Tree'],
          correct: 1,
        },
      },
      {
        id: 'ds3',
        question_text: 'What is a balanced binary tree?',
        type: 'MCQ',
        metadata: {
          options: [
            'Heights of left and right subtrees differ by at most one',
            'Tree with equal number of nodes',
            'Tree with all leaves at same level',
            'Complete binary tree',
          ],
          correct: 0,
        },
      },
      {
        id: 'ds4',
        question_text:
          'Which sorting algorithm has best average case performance?',
        type: 'MCQ',
        metadata: {
          options: [
            'Bubble Sort',
            'Quick Sort',
            'Selection Sort',
            'Insertion Sort',
          ],
          correct: 1,
        },
      },
      {
        id: 'ds5',
        question_text: 'What is the main advantage of a hash table?',
        type: 'MCQ',
        metadata: {
          options: [
            'O(1) average case for insertion and lookup',
            'Maintains order of elements',
            'Uses less memory than arrays',
            'Better for sequential access',
          ],
          correct: 0,
        },
      },
    ],
    4: [
      // Web Development
      {
        id: 'web1',
        question_text: 'What is the purpose of CSS Box Model?',
        type: 'MCQ',
        metadata: {
          options: [
            'To define spacing around elements',
            'To create 3D boxes',
            'To organize HTML code',
            'To manage server requests',
          ],
          correct: 0,
        },
      },
      {
        id: 'web2',
        question_text: 'Which HTTP method is idempotent?',
        type: 'MCQ',
        metadata: {
          options: ['POST', 'PUT', 'PATCH', 'DELETE'],
          correct: 1,
        },
      },
      {
        id: 'web3',
        question_text: 'What is the purpose of localStorage?',
        type: 'MCQ',
        metadata: {
          options: [
            'Store data in browser without expiration',
            'Store server-side data',
            'Cache HTTP requests',
            'Store session cookies',
          ],
          correct: 0,
        },
      },
      {
        id: 'web4',
        question_text: 'What is CORS?',
        type: 'MCQ',
        metadata: {
          options: [
            'Cross-Origin Resource Sharing',
            'Cross-Origin Request Service',
            'Client Origin Response System',
            'Configured Origin Request Service',
          ],
          correct: 0,
        },
      },
      {
        id: 'web5',
        question_text: 'Which is not a valid HTTP status code?',
        type: 'MCQ',
        metadata: {
          options: ['200', '404', '600', '500'],
          correct: 2,
        },
      },
    ],
    5: [
      // Database Design
      {
        id: 'db1',
        question_text: 'What is normalization in database design?',
        type: 'MCQ',
        metadata: {
          options: [
            'Process of organizing data to reduce redundancy',
            'Converting data to numbers',
            'Sorting data in tables',
            'Backup process',
          ],
          correct: 0,
        },
      },
      {
        id: 'db2',
        question_text: 'Which is not a type of SQL join?',
        type: 'MCQ',
        metadata: {
          options: ['INNER JOIN', 'LEFT JOIN', 'CIRCULAR JOIN', 'CROSS JOIN'],
          correct: 2,
        },
      },
      {
        id: 'db3',
        question_text: 'What is a primary key?',
        type: 'MCQ',
        metadata: {
          options: [
            'Unique identifier for each record',
            'First column in table',
            'Most important data',
            'Admin password',
          ],
          correct: 0,
        },
      },
      {
        id: 'db4',
        question_text: 'What is the purpose of an index in a database?',
        type: 'MCQ',
        metadata: {
          options: [
            'Speed up data retrieval',
            'Save storage space',
            'Encrypt data',
            'Format data',
          ],
          correct: 0,
        },
      },
      {
        id: 'db5',
        question_text: 'Which is a NoSQL database?',
        type: 'MCQ',
        metadata: {
          options: ['MongoDB', 'MySQL', 'PostgreSQL', 'Oracle'],
          correct: 0,
        },
      },
    ],
    6: [
      // System Design
      {
        id: 'sd1',
        question_text: 'What is load balancing?',
        type: 'MCQ',
        metadata: {
          options: [
            'Distributing traffic across servers',
            'Loading data into database',
            'System backup process',
            'Memory management',
          ],
          correct: 0,
        },
      },
      {
        id: 'sd2',
        question_text: 'What is the CAP theorem?',
        type: 'MCQ',
        metadata: {
          options: [
            'Consistency, Availability, Partition tolerance',
            'Caching, APIs, Performance',
            'Configuration, Authentication, Protocols',
            'Control, Access, Permission',
          ],
          correct: 0,
        },
      },
      {
        id: 'sd3',
        question_text: 'What is the purpose of caching?',
        type: 'MCQ',
        metadata: {
          options: [
            'Improve response time and reduce load',
            'Increase storage capacity',
            'Secure data transmission',
            'Organize code structure',
          ],
          correct: 0,
        },
      },
      {
        id: 'sd4',
        question_text: 'Which is not a microservices characteristic?',
        type: 'MCQ',
        metadata: {
          options: [
            'Independent deployment',
            'Loose coupling',
            'Shared database',
            'Service discovery',
          ],
          correct: 2,
        },
      },
      {
        id: 'sd5',
        question_text: 'What is horizontal scaling?',
        type: 'MCQ',
        metadata: {
          options: [
            'Adding more machines',
            'Upgrading existing machine',
            'Improving code efficiency',
            'Adding more storage',
          ],
          correct: 0,
        },
      },
    ],
  };

  const questions = questionsByExam[examId] || [];

  return {
    status: 'success',
    responseMsg: 'QUESTIONS_FETCHED',
    payload: {
      total: questions.length,
      page,
      limit,
      totalPages: Math.ceil(questions.length / limit),
      questions: questions,
    },
  };
}
