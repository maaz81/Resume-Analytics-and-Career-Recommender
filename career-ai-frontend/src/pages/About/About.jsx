import { motion } from "framer-motion";

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
            <div className="max-w-5xl w-full">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                        About Our Project
                    </h1>
                    <p className="text-gray-600 mt-4 text-lg">
                        Built with passion, learning, and real-world collaboration 🚀
                    </p>
                </motion.div>

                {/* Cards */}
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Maaz Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300"
                    >
                        <div className="flex flex-col items-center text-center">
                            <img
                                src="/Maaz baner photo.png"
                                alt="Maaz Ahmad Khan"
                                className="w-28 h-28 rounded-full object-cover mb-4 ring-4 ring-indigo-100 shadow-md"
                            />
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Maaz Ahmad Khan
                            </h2>
                            <p className="text-sm text-indigo-600 font-medium mt-1">
                                Junior Developer (3 Months Experience)
                            </p>
                            <p className="text-gray-600 mt-4">
                                Passionate about building AI-powered applications and exploring
                                full-stack development. Focused on learning modern technologies
                                like React, Node.js, and integrating AI into real-world projects.
                            </p>
                        </div>
                    </motion.div>

                    {/* Yash Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300"
                    >
                        <div className="flex flex-col items-center text-center">
                            <img
                                src="/yash baner photo.jpeg"
                                alt="Yash Bhagwatkar"
                                className="w-28 h-28 rounded-full object-cover mb-4 ring-4 ring-green-100 shadow-md"
                            />
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Yash Bhagwatkar
                            </h2>
                            <p className="text-sm text-green-600 font-medium mt-1">
                                Senior Software Developer (10+ Years Experience)
                            </p>
                            <p className="text-gray-600 mt-4">
                                Experienced software engineer specializing in scalable systems,
                                architecture design, and mentoring developers. Passionate about
                                building high-quality products and guiding teams toward success.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-center mt-12 text-gray-500"
                >
                    <p>Made with ❤️ using React & Tailwind CSS</p>
                </motion.div>
            </div>
        </div>
    );
}
