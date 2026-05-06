import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import React, { useState, useEffect } from 'react';
import HomeSlider from '../components/Home/HomeSlider';
import HomeClasses from '../components/Home/HomeClasses';
import HomeNewCourses from '../components/Home/HomeNewCourses';
import HomeAbout from '../components/Home/HomeAbout';
import TestimonialsSlider from '../components/Shared/TestimonialsSlider';
import { getUpcomingPrograms, getPrograms, getApprovedStudentWorks } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';
import PageLoading from '../components/Shared/PageLoading';

const Home = () => {
  const { t } = useTranslation();
  const [data, setData] = useState({
    upcomingSlides: [],
    programs: [],
    studentWorks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getUpcomingPrograms(3),
      getPrograms(),
      getApprovedStudentWorks()
    ]).then(([upcomingRes, programsRes, studentWorksRes]) => {
      // programsRes is an object with { data, totalPages... } because we paginate in backend now
      const allPrograms = programsRes?.data || programsRes || [];
      const featuredPrograms = allPrograms
        .filter(p => p.isFeatured)
        .slice(0, 3);
      
      let heroSlides = featuredPrograms;
      if (heroSlides.length === 0) {
        heroSlides = [...allPrograms].sort((a, b) => (b.students || 0) - (a.students || 0)).slice(0, 3);
      }
      
      setData({
        upcomingSlides: heroSlides,
        programs: allPrograms,
        studentWorks: studentWorksRes?.data || studentWorksRes || []
      });
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch home data", err);
      setLoading(false);
    });
  }, []);

  useInitOnLoaded(loading);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <>
      <HomeSlider slides={data.upcomingSlides} />
      <HomeClasses classes={data.programs.filter(p => p.isFeatured)} />
      <HomeNewCourses classes={data.programs.filter(p => !p.isFeatured)} />
      <HomeAbout />
      <TestimonialsSlider works={data.studentWorks} />
    </>
  );
};

export default Home;
