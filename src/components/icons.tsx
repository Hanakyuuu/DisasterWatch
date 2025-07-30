import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 11.13a3.5 3.5 0 0 0-3.5 3.37c0 .2.01.4.04.6.26 1.18 1.44 2.16 3.46 2.16s3.2-1 3.46-2.16a3.34 3.34 0 0 0 .04-.6 3.5 3.5 0 0 0-3.5-3.37z" />
    </svg>
  );
}
