import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import React, { useState, useEffect } from 'react';
import HomeSlider from '../components/Home/HomeSlider';
import HomeClasses from '../components/Home/HomeClasses';
import HomeNewCourses from '../components/Home/HomeNewCourses';
import HomeAbout from '../components/Home/HomeAbout';
import TestimonialsSlider from '../components/Shared/TestimonialsSlider';
import { getBanners, getPrograms, getApprovedStudentWorks } from '../services/api';
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
      getBanners({ isActive: true }), // Fetch active banners
      getPrograms({ isFeatured: true, page: 1, limit: 3 }),
      getPrograms({ isFeatured: false, page: 1, limit: 8 }),
      getApprovedStudentWorks()
    ]).then(([bannersRes, featuredRes, newRes, studentWorksRes]) => {
      const featuredData = featuredRes?.data || featuredRes || [];
      const newData = newRes?.data || newRes || [];
      const bannersData = bannersRes?.data || bannersRes || [];

      // Map banner data to what HomeSlider expects (title, thumbnail, saleEndDate)
      const mappedBanners = bannersData.map(banner => ({
        id: banner.id,
        title: banner.title,
        slug: banner.targetUrl?.replace('/program/', '') || '',
        thumbnail: banner.imageUrl,
        saleEndDate: banner.countdownDate
      }));

      setData({
        upcomingSlides: mappedBanners,
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
