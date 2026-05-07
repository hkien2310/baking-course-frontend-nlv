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
      getPrograms({ hasDiscount: true, page: 1, limit: 5 }), // Fetch programs with active discount
      getPrograms({ isFeatured: true, page: 1, limit: 3 }),
      getPrograms({ isFeatured: false, page: 1, limit: 8 }),
      getApprovedStudentWorks()
    ]).then(([discountedRes, featuredRes, newRes, studentWorksRes]) => {
      const featuredData = featuredRes?.data || featuredRes || [];
      const newData = newRes?.data || newRes || [];
      const discountedData = discountedRes?.data || discountedRes || [];
      
      // Only show programs with an actual expiration date in the Flash Sale slider
      // Those without saleEndDate are ignored for the hero section
      const heroSlides = discountedData.filter(p => p.saleEndDate);
      
      /* [FALLBACK REMOVED] - Only show slider if there are actual expiring flash sales
      if (heroSlides.length === 0) {
        heroSlides = featuredData.length > 0 ? featuredData : newData.slice(0, 3);
      }
      */
      
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
      {data.upcomingSlides.length > 0 && <HomeSlider slides={data.upcomingSlides} />}
      <HomeClasses classes={data.featuredPrograms} />
      <HomeNewCourses classes={data.newPrograms} />
      <HomeAbout />
      <TestimonialsSlider works={data.studentWorks} />
    </>
  );
};

export default Home;
