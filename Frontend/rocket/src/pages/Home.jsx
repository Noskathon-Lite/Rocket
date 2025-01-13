import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import About from "./About";
import Contact from "./Contact";

const Home = () => {
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.3 }}
    transition={{ duration: 1 }}
    className="absolute inset-0 bg-black"
  />;
  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Simulated API call - replace with actual API endpoint
        // const response = await fetch('your-api-endpoint');
        // const data = await response.json();
        // setContent(data);
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };
  }, []);

  return (
    <div>
      <div className="relative min-h-[100dvh] flex items-center justify-center">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('${content.backgroundImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-30"></div>
        </div>
        <div className="w-full min-h-[100dvh] flex items-center justify-center p-4">
          <div className="w-full max-w-[90vw] md:max-w-[800px] text-center flex flex-col items-center justify-center z-10 py-8">
            <motion.h1
              className="text-white uppercase text-[2rem] xs:text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] leading-[1.2] font-title tracking-wide"
              {...fadeInUp}
            >
              <span className="inline-block mb-2 sm:mb-0 sm:mr-4">
                {content.title.line1}
              </span>
              <span className="relative inline-block mb-2">
                {content.title.line2}
              </span>
              <span className="block mt-2">{content.title.line3}</span>
            </motion.h1>
            <motion.p
              className="text-white w-full max-w-[85vw] sm:max-w-2xl mt-4 mb-6 text-[0.875rem] xs:text-base sm:text-lg font-semibold font-paragraph leading-relaxed"
              {...fadeIn}
            >
              {content.description}
            </motion.p>

            <motion.div {...fadeInDown} className="mt-2 sm:mt-4">
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg transition duration-300 font-poppins text-base sm:text-lg"
              >
                {content.ctaText}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
      <About />
      <Contact />
    </div>
  );
};

export default Home;
