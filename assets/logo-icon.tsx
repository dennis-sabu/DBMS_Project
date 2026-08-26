type LogoIconProps = {
  className?: string;
};

/**
 * Brand glyph for NotesHub — a stack of three notes with a folded
 * corner, echoing the "notes" theme. Color follows `currentColor`
 * so callers control the palette through CSS.
 */
export default function LogoIcon({ className }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M11 4.5C11 3.67157 11.6716 3 12.5 3H22.5C23.3284 3 24 3.67157 24 4.5V20.5C24 21.3284 23.3284 22 22.5 22H12.5C11.6716 22 11 21.3284 11 20.5V4.5Z"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <path
        d="M14 7.5C14 6.94772 14.4477 6.5 15 6.5H21.5C22.0523 6.5 22.5 6.94772 22.5 7.5C22.5 8.05228 22.0523 8.5 21.5 8.5H15C14.4477 8.5 14 8.05228 14 7.5Z"
        fill="currentColor"
      />
      <path
        d="M14 11.5C14 10.9477 14.4477 10.5 15 10.5H21.5C22.0523 10.5 22.5 10.9477 22.5 11.5C22.5 12.0523 22.0523 12.5 21.5 12.5H15C14.4477 12.5 14 12.0523 14 11.5Z"
        fill="currentColor"
      />
      <path
        d="M14 15.5C14 14.9477 14.4477 14.5 15 14.5H19.5C20.0523 14.5 20.5 14.9477 20.5 15.5C20.5 16.0523 20.0523 16.5 19.5 16.5H15C14.4477 16.5 14 16.0523 14 15.5Z"
        fill="currentColor"
      />
      <path
        d="M6.5 11C6.5 10.1716 7.17157 9.5 8 9.5H18C18.8284 9.5 19.5 10.1716 19.5 11V27C19.5 27.8284 18.8284 28.5 18 28.5H8C7.17157 28.5 6.5 27.8284 6.5 27V11Z"
        fill="currentColor"
      />
      <path
        d="M9.5 14C9.5 13.4477 9.94772 13 10.5 13H17C17.5523 13 18 13.4477 18 14C18 14.5523 17.5523 15 17 15H10.5C9.94772 15 9.5 14.5523 9.5 14Z"
        fill="white"
        fillOpacity="0.7"
      />
      <path
        d="M9.5 18C9.5 17.4477 9.94772 17 10.5 17H17C17.5523 17 18 17.4477 18 18C18 18.5523 17.5523 19 17 19H10.5C9.94772 19 9.5 18.5523 9.5 18Z"
        fill="white"
        fillOpacity="0.7"
      />
      <path
        d="M9.5 22C9.5 21.4477 9.94772 21 10.5 21H15C15.5523 21 16 21.4477 16 22C16 22.5523 15.5523 23 15 23H10.5C9.94772 23 9.5 22.5523 9.5 22Z"
        fill="white"
        fillOpacity="0.7"
      />
    </svg>
  );
}
