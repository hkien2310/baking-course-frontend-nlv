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
    featuredPrograms: [],
    newPrograms: [],
    studentWorks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getUpcomingPrograms(3),
      getPrograms({ isFeatured: true, page: 1, limit: 3 }),
      getPrograms({ isFeatured: false, page: 1, limit: 8 }),
      getApprovedStudentWorks()
    ]).then(([upcomingRes, featuredRes, newRes, studentWorksRes]) => {
      const featuredData = featuredRes?.data || featuredRes || [];
      const newData = newRes?.data || newRes || [];
      const upcomingData = upcomingRes?.data || upcomingRes || [];
      
      // Prioritize actual upcoming programs (with countdowns) for the slider
      // If none, fallback to featured programs, then to newest programs
      let heroSlides = upcomingData;
      if (heroSlides.length === 0) {
        heroSlides = featuredData.length > 0 ? featuredData : newData.slice(0, 3);
      }
      
      setData({
        upcomingSlides: heroSlides,
        featuredPrograms: featuredData,
        newPrograms: newData,
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
      <HomeClasses classes={data.featuredPrograms} />
      <HomeNewCourses classes={data.newPrograms} />
      <HomeAbout />
      <TestimonialsSlider works={data.studentWorks} />
    </>
  );
};

export default Home;
