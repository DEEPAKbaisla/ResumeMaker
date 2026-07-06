import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  ArrowUpRight,
} from "lucide-react";

const ATsTemplate = ({ data, accentColor = "#166534" }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month] = dateStr.split("-");
    return new Date(year, month - 1).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <div
      className="max-w-4xl mx-auto p-8 bg-white text-gray-900"
      style={{ fontFamily: "serif" }}>
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-4xl mb-2" style={{ color: accentColor }}>
          {data.personal_info?.full_name || "Your Name"}
        </h1>

        <div className="flex flex-wrap justify-center items-center text-sm gap-2">
          {data.personal_info?.email && (
            <>
              <div className="flex items-center gap-1">
                <Mail className="size-3" />
                <a href={`mailto:${data.personal_info.email}`}>
                  {data.personal_info.email}
                </a>
              </div>
              <span className="text-gray-400">—</span>
            </>
          )}
          {data.personal_info?.phone && (
            <>
              <div className="flex items-center gap-1">
                <Phone className="size-3" />
                <a href={`tel:${data.personal_info.phone}`}>
                  {data.personal_info.phone}
                </a>
              </div>
              <span className="text-gray-400">—</span>
            </>
          )}
          {data.personal_info?.linkedin && (
            <>
              <div className="flex items-center gap-1">
                <Linkedin className="size-3" />
                <a
                  target="_blank"
                  href={data.personal_info.linkedin}
                  rel="noreferrer">
                  {data.personal_info.linkedin
                    .replace("https://www.", "")
                    .replace("https://", "")}
                </a>
              </div>
              <span className="text-gray-400">—</span>
            </>
          )}
          {data.personal_info?.website && (
            <div className="flex items-center gap-1">
              <Globe className="size-3" />
              <a
                target="_blank"
                href={data.personal_info.website}
                rel="noreferrer">
                {data.personal_info.website
                  .replace("https://www.", "")
                  .replace("https://", "")}
              </a>
            </div>
          )}
        </div>
        <hr className="mt-4 border-t-2" style={{ borderColor: accentColor }} />
      </header>

      {/* <header className="text-center mb-6">
        <h1 className="text-4xl mb-2" style={{ color: accentColor }}>
          {data.personal_info?.full_name || "Your Name"}
        </h1>

        <div className="flex flex-wrap justify-center items-center text-sm gap-2">
          {data.personal_info?.email && (
            <>
              <div className="flex items-center gap-1">
                <Mail className="size-3" />
                <a href={`mailto:${data.personal_info.email}`}>
                  {data.personal_info.email}
                </a>
              </div>
              <span className="text-gray-400">—</span>
            </>
          )}

          {data.personal_info?.phone && (
            <>
              <div className="flex items-center gap-1">
                <Phone className="size-3" />
                <a href={`tel:${data.personal_info.phone}`}>
                  {data.personal_info.phone}
                </a>
              </div>
              <span className="text-gray-400">—</span>
            </>
          )}

          {data.personal_info?.linkedin && (
            <>
              <div className="flex items-center gap-1">
                <Linkedin className="size-3" />
                <a
                  href={data.personal_info.linkedin}
                  target="_blank"
                  rel="noopener noreferrer">
                  {data.personal_info.linkedin.replace(
                    /^https?:\/\/(www\.)?/,
                    "",
                  )}
                </a>
              </div>
              <span className="text-gray-400">—</span>
            </>
          )}

          {data.personal_info?.website && (
            <div className="flex items-center gap-1">
              <Globe className="size-3" />
              <a
                href={data.personal_info.website}
                target="_blank"
                rel="noopener noreferrer">
                {data.personal_info.website.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </div>
          )}
        </div>

        <hr className="mt-4 border-t-2" style={{ borderColor: accentColor }} />
      </header> */}

      {/* Summary */}
      {data.professional_summary && (
        <section className="mb-4">
          <p className="text-gray-800 leading-snug">
            <span
              className="font-bold text-lg mr-2"
              style={{ color: accentColor }}>
              Summary —
            </span>
            {data.professional_summary}
          </p>
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-4">
          <h2
            className="text-xl font-bold mb-2 border-b"
            style={{ color: accentColor, borderColor: accentColor }}>
            Skills
          </h2>
          <div className="text-gray-800">
            <p>
              <span className="font-bold">Core Skills</span>{" "}
              {data.skills.join(", ")}
            </p>
          </div>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-4">
          <h2
            className="text-xl font-bold mb-2 border-b"
            style={{ color: accentColor, borderColor: accentColor }}>
            Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-center font-bold">
                  <span>{exp.company}</span>
                  <span>
                    {formatDate(exp.start_date)} –{" "}
                    {exp.is_current ? "Present" : formatDate(exp.end_date)}
                  </span>
                </div>
                <div className="italic text-gray-700 mb-1">{exp.position}</div>
                {exp.description && (
                  <div
                    className="text-gray-800 leading-snug whitespace-pre-line pl-4"
                    style={{
                      display: "list-item",
                      listStyleType: "disc",
                      marginLeft: "1rem",
                    }}>
                    {exp.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mb-4">
          <h2
            className="text-xl font-bold mb-2 border-b"
            style={{ color: accentColor, borderColor: accentColor }}>
            Education
          </h2>
          <div className="space-y-2">
            {data.education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-center font-bold">
                  <span>{edu.institution}</span>
                  <span>
                    {formatDate(edu.graduation_date) || "Graduation Year"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-700 italic">
                  <span>
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </span>
                  {edu.gpa && <span>CGPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.project && data.project.length > 0 && (
        <section className="mb-4">
          <h2
            className="text-xl font-bold mb-2 border-b"
            style={{ color: accentColor, borderColor: accentColor }}>
            Projects
          </h2>
          <div className="space-y-4">
            {data.project.map((proj, index) => (
              <div key={index}>
                <div className="font-bold flex items-center">
                  {proj.link ? (
                    <a
                      href={
                        proj.link.startsWith("http")
                          ? proj.link
                          : `https://${proj.link}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center"
                      style={{ color: accentColor }}>
                      {proj.name}
                      <ArrowUpRight
                        size={14}
                        className="inline-block ml-1.5 flex-shrink-0"
                      />
                    </a>
                  ) : (
                    proj.name
                  )}
                </div>
                {proj.description && (
                  <div
                    className="text-gray-800 leading-snug pl-4 mt-1"
                    style={{
                      display: "list-item",
                      listStyleType: "disc",
                      marginLeft: "1rem",
                    }}>
                    {proj.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ATsTemplate;
