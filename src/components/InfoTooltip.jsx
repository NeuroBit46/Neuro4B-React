import { useState } from 'react';
import { Icons } from '../constants/Icons';

export default function InfoTooltip({ message }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block mt-1"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="cursor-pointer">
        {Icons.info(visible)}
      </span>

      {visible && (
        <p className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[calc(100%+4px)]
          text-sm text-primary-bg bg-secondary p-2 rounded-lg shadow-sm 
          w-[300px] whitespace-normal z-50"
        >
          {message}
        </p>
      )}
    </div>
  );
}
