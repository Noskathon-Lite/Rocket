export default function About() {
  const teamMembers = [
    {
      name: "Mehfuz Alam",
      role: "Backend",
      bio: "A Backend developer and a group leader to lead the project to fruition as well as having a history with Django.",
      imageUrl: "mehfuz.jpg",
    },
    {
      name: "Nadish Acharya",
      role: "AI Developer",
      bio: "A backend developer with expertise in AI, Nadish brings technical excellence to our projects.",
      imageUrl: "nadish.jpg",
    },
    {
      name: "Roshan Chaudhary",
      role: "Frontend, UX Designer",
      bio: "Roshan combines creativity with user-centric design principles to create intuitive and beautiful interfaces.",
      imageUrl: "Roshan.JPG",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            About Us
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Meet our talented team who make the magic happen
          </p>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <div className="aspect-square relative">
                <img
                  src={member.imageUrl}
                  alt={`Photo of ${member.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {member.name}
                </h3>
                <p className="text-sm font-medium text-primary mt-1">
                  {member.role}
                </p>
                <p className="mt-3 text-base text-gray-500">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional About Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            We are dedicated to delivering exceptional solutions that helps in
            parking management and enhance user experiences. Through innovation
            and collaboration, we strive to create meaningful impact in
            everything we do.
          </p>
        </div>
      </div>
    </div>
  );
}
