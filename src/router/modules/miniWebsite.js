// 微官网
const Layout = () => import('@/views/layout')

export default {
  path: '/miniWebsite',
  component: Layout,
  children: [
    {
      path: 'banner',
      name: 'MiniWebsiteBannerManager',
      component: () => import('_v/miniWebsite/BannerManager'),
      meta: {
        title: '轮播图管理-微官网-桃李云帮'
      }
    },
    {
      path: 'teacher',
      name: 'MiniWebsiteTeacherManager',
      component: () => import('_v/miniWebsite/TeacherManager'),
      meta: {
        title: '优秀教师-微官网-桃李云帮'
      }
    },
    {
      path: 'student',
      name: 'MiniWebsiteStudentManager',
      component: () => import('_v/miniWebsite/StudentManager'),
      meta: {
        title: '优秀学员-微官网-桃李云帮'
      }
    },
    {
      path: 'educationIdea',
      name: 'MiniWebsiteEducationIdeaoManager',
      component: () => import('_v/miniWebsite/EducationIdeaoManager'),
      meta: {
        title: '办学理念-微官网-桃李云帮'
      }
    },
    {
      path: 'feature',
      name: 'MiniWebsiteFeatureManager',
      component: () => import('_v/miniWebsite/FeatureManager'),
      meta: {
        title: '教学特色-微官网-桃李云帮'
      }
    },
    {
      path: 'environment',
      name: 'MiniWebsiteEnvironmentManager',
      component: () => import('_v/miniWebsite/EnvironmentManager'),
      meta: {
        title: '教学环境-微官网-桃李云帮'
      }
    },
    {
      path: 'courseInfo',
      name: 'MiniWebsiteCourseInfoManager',
      component: () => import('_v/miniWebsite/CourseInfoManager'),
      meta: {
        title: '课程信息-微官网-桃李云帮'
      }
    },
    {
      path: 'activity',
      name: 'MiniWebsiteActivityManager',
      component: () => import('_v/miniWebsite/ActivityManager'),
      meta: {
        title: '校区活动-微官网-桃李云帮'
      }
    },
    {
      path: 'news',
      name: 'MiniWebsiteNewsManager',
      component: () => import('_v/miniWebsite/NewsManager'),
      meta: {
        title: '新闻资讯-微官网-桃李云帮'
      }
    },
    {
      path: 'organizationInfo',
      name: 'MiniWebsiteOrganizationInfoManager',
      component: () => import('_v/miniWebsite/OrganizationInfoManager'),
      meta: {
        title: '关于机构-微官网-桃李云帮'
      }
    }
  ]
}
