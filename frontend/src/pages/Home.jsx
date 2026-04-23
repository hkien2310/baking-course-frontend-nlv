import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import React, { useState, useEffect } from 'react';
import HomeSlider from '../components/Home/HomeSlider';
import HomeClasses from '../components/Home/HomeClasses';
import HomeNewCourses from '../components/Home/HomeNewCourses';
import HomeAbout from '../components/Home/HomeAbout';
import TestimonialsSlider from '../components/Shared/TestimonialsSlider';
import HomeTimetables from '../components/Home/HomeTimetables';
import HomeFaq from '../components/Home/HomeFaq';
import HomeChiefs from '../components/Home/HomeChiefs';
import HomeContacts from '../components/Home/HomeContacts';
import HomeBlog from '../components/Home/HomeBlog';
import { getUpcomingPrograms, getPrograms, getChiefs, getPosts, getTestimonials, getTimetables } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

const Home = () => {
  const { t } = useTranslation();
  const [data, setData] = useState({
    upcomingSlides: [],
    programs: [],
    chiefs: [],
    posts: [],
    testimonials: [],
    timetables: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getUpcomingPrograms(3),
      getPrograms(),
      getChiefs(),
      getPosts(),
      getTestimonials(),
      getTimetables()
    ]).then(([upcomingRes, programsRes, chiefsRes, postsRes, testimonialsRes, timetablesRes]) => {
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
        chiefs: chiefsRes?.data || chiefsRes || [],
        posts: postsRes?.data || postsRes || [],
        testimonials: testimonialsRes?.data || testimonialsRes || [],
        timetables: timetablesRes?.data || timetablesRes || []
      });
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch home data", err);
      setLoading(false);
    });
  }, []);

  useInitOnLoaded(loading);

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '150px 0' }}>
        <h2>{t('home.loading')}</h2>
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  return (
    <>
      <HomeSlider slides={data.upcomingSlides} />
      <HomeClasses classes={data.programs.filter(p => p.isFeatured)} />
      <HomeNewCourses classes={data.programs.filter(p => !p.isFeatured)} />
      <TestimonialsSlider testimonials={data.testimonials} />
      <HomeAbout />
    </>
  );
};

export default Home;
