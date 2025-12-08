import Link from "next/link";
import Image from "next/image";

const CoachCard = ({ coach }) => {
  return (
    <div className="card group hover:scale-105 transition-all duration-300">
      <div className="flex flex-col h-full">
        {/* Coach Image */}
        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
          {coach.image ? (
            <Image
              src={coach.image}
              alt={coach.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {coach.name?.split(' ').map(n => n[0]).join('') || 'C'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Coach Info */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[var(--primary)] transition-colors">
            {coach.name}
          </h3>
          
         {/*  <p className="text-sm text-[var(--primary)] font-semibold mb-2">
            {coach.expertise || "General Coaching"}
          </p>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {coach.bio || "Experienced coach ready to help you achieve your goals."}
          </p> */}
          
          <div className="space-y-2 mt-4 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Rating:</span>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="font-semibold">{coach.rating || "4.5"}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Sessions:</span>
              <span className="font-semibold">{coach.sessions_completed || "50+"}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Price:</span>
              <span className="font-bold text-[var(--primary)]">{coach.price || "₹1000+"}</span>
            </div>
          </div>
          
          {coach.skills && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Skills:</p>
              <div className="flex flex-wrap gap-1">
                {coach.skills.split(',').slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {skill.trim()}
                  </span>
                ))}
                {coach.skills.split(',').length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    +{coach.skills.split(',').length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-4">
          <Link
            href={`/dashboard/userdashboard/booksession?coachId=${coach.id}`}
            className="btn btn-primary w-full text-center"
          >
            Book Session
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CoachCard;
