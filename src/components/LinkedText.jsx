import { textLinks } from "../text-links.mjs";
export default function LinkedText({ children, legal }) {
  return textLinks(children, legal).map((part, index) =>
    part.href ? (
      <a
        key={index}
        href={part.href}
        target={part.external ? "_blank" : undefined}
        rel={part.external ? "noopener noreferrer" : undefined}
      >
        {part.text}
      </a>
    ) : (
      part.text
    ),
  );
}
