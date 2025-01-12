import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import About from "./About";
import Contact from "./Contact";

const Home = () => {
  return (
    <div>
      <div className="relative min-h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/parkingbg2.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
        </div>
        <div className="w-full h-screen flex items-center justify-center">
          <div className="max-w-[800px] text-center flex flex-col items-center justify-center z-10">
            <motion.h1
              className="text-white uppercase text-5xl md:text-6xl lg:text-7xl leading-tight font-title tracking-wide"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="mr-8">Effortless</span>
              <span className="relative">Parking</span>
              <span className="mt-4 block">Management</span>
            </motion.h1>
            <motion.p
              className="text-white w-full max-w-2xl my-8 text- md:text-lg font-semibold font-paragraph leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Welcome to Autoplate, where we streamline your parking experience.
              Our system records vehicle entries and exits, providing real-time
              availability updates. Sign in to manage your parking effortlessly
              and enjoy a hassle-free experience.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 font-poppins text-lg"
              >
                Get Started
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
