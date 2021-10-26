// 教务管理
const Layout = () => import('@/views/layout')

export default {
  path: '/educational',
  name: 'Educational',
  component: Layout,
  meta: {
    title: '教务管理'
  },
  children: [
    {
      path: 'student',
      name: 'Student',
      component: () => import('_v/educational/student'),
      meta: {
        keepAlive: true,
        title: '学员中心-桃李云帮'
      }
    },
    {
      path: 'studentSignUp',
      name: 'StudentSignUp',
      component: () => import('_v/educational/studentSignUp'),
      meta: {
        keepAlive: true,
        title: '报名管理-桃李云帮'
      }
    },
    {
      path: 'studentSignUpInformation',
      name: 'StudentSignUpInformation',
      component: () => import('_v/educational/studentSignUp/StudentSignUpInformation'),
      meta: {
        isLeaf: true,
        title: '学员报名详情-桃李云帮'
      }
    },
    {
      path: 'studentEnroll',
      name: 'StudentEnroll',
      component: () => import('_v/educational/studentEnroll'),
      meta: {
        isLeaf: true,
        title: '学员报名-桃李云帮'
      }
    },
    {
      path: 'class',
      name: 'Class',
      component: () => import('_v/educational/class'),
      meta: {
        // keepAlive: true,
        title: '班级管理-桃李云帮'
      }
    },
    {
      path: 'timetable',
      name: 'Timetable',
      component: () => import('_v/educational/timetable'),
      meta: {
        // 不需要缓存
        title: '排课管理-桃李云帮'
      }
    },
    {
      path: 'course',
      name: 'Course',
      component: () => import('_v/educational/course'),
      meta: {
        keepAlive: true,
        title: '课程管理-桃李云帮'
      }
    },
    {
      path: 'studentFile',
      name: 'StudentFile',
      component: () => import('_v/educational/studentFile'),
      meta: {
        keepAlive: true,
        title: '学员档案-桃李云帮'
      }
    }
    // {
    //   path: 'teacherEduStatistics',
    //   name: 'TeacherEduStatistics',
    //   component: () => import('_v/educational/teacherEduStatistics'),
    //   meta: {
    //     keepAlive: true,
    //     title: '教师绩效统计-桃李云帮'
    //   }
    // }
  ]
}
