import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const imgBell = '/assets/cddd6.svg';
const imgAvatar = '/assets/b3c9e.svg';
const imgSettings = '/assets/94e94.svg';

interface TopBarProps {
  context?: string;
  title: string;
  userName?: string;
  userRole?: string;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');
  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function fromDateInputValue(value: string) {
  const [year, month, day] =
    value.split('-').map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

export default function TopBar({
  context = 'HospitalFlow Admin',
  title,
  userName = 'Dr. Sharma',
  userRole = 'General Medicine',
}: TopBarProps) {
  const navigate = useNavigate();

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [selectedDate, setSelectedDate] =
    useState(() => new Date());

  const notificationRef =
    useRef<HTMLDivElement>(null);

  const profileRef =
    useRef<HTMLDivElement>(null);

  /*
   * Close dropdowns when user clicks outside.
   */
  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          target
        )
      ) {
        setNotificationOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(
          target
        )
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  const handleNotificationClick = () => {
    setNotificationOpen(
      (current) => !current
    );

    setProfileOpen(false);
  };

  const handleProfileClick = () => {
    setProfileOpen(
      (current) => !current
    );

    setNotificationOpen(false);
  };

  const handleDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.value) {
      return;
    }

    setSelectedDate(
      fromDateInputValue(
        event.target.value
      )
    );
  };

  return (
    <div className="bg-white border-[#d8e1ec] border-b border-solid flex h-[72px] items-center justify-between px-[24px] shrink-0 w-full">

      {/* =====================================================
          LEFT SIDE
          ===================================================== */}

      <div className="flex flex-col gap-[3px] items-start">

        <p className="font-normal text-[#7b899c] text-[11px] leading-none">
          {context}
        </p>

        <p className="font-bold text-[#142033] text-[15px] leading-none">
          {title}
        </p>

      </div>


      {/* =====================================================
          RIGHT SIDE
          ===================================================== */}

      <div className="flex gap-[14px] items-center">

        {/* ===================================================
            NOTIFICATIONS
            =================================================== */}

        <div
          ref={notificationRef}
          className="relative"
        >

          <button
            type="button"
            onClick={
              handleNotificationClick
            }
            aria-label="Notifications"
            aria-expanded={
              notificationOpen
            }
            className="relative flex items-center justify-center shrink-0 size-[34px] rounded-[9px] hover:bg-[#f4f7fb] transition-colors cursor-pointer"
          >
            <img
              alt="Notifications"
              className="size-[20px]"
              src={imgBell}
            />

            {/* Notification dot */}
            <span className="absolute top-[6px] right-[6px] size-[6px] bg-[#e05260] rounded-full border-2 border-white" />
          </button>


          {notificationOpen && (
            <div className="absolute right-0 top-[44px] z-50 w-[300px] bg-white border border-[#d8e1ec] rounded-[12px] shadow-[0px_8px_28px_0px_rgba(19,36,58,0.14)] overflow-hidden">

              <div className="flex items-center justify-between px-[16px] py-[13px] border-b border-[#edf1f6]">

                <p className="font-bold text-[#142033] text-[14px]">
                  Notifications
                </p>

                <span className="text-[10px] font-semibold text-[#155ead] bg-[#eaf3fd] px-[7px] py-[4px] rounded-full">
                  1 new
                </span>

              </div>


              <div className="px-[16px] py-[14px]">

                <div className="flex gap-[10px]">

                  <div className="size-[30px] shrink-0 rounded-full bg-[#eaf3fd] flex items-center justify-center">
                    <span className="text-[#155ead] text-[13px] font-bold">
                      OPD
                    </span>
                  </div>

                  <div>
                    <p className="font-semibold text-[#142033] text-[12px]">
                      OPD operations are active
                    </p>

                    <p className="text-[#7b899c] text-[11px] mt-[3px] leading-[1.4]">
                      Check today's appointments
                      and waiting queue.
                    </p>
                  </div>

                </div>

              </div>


              <div className="border-t border-[#edf1f6] px-[16px] py-[10px]">

                <button
                  type="button"
                  onClick={() => {
                    setNotificationOpen(
                      false
                    );
                    navigate(
                      '/admin/appointments'
                    );
                  }}
                  className="text-[#155ead] text-[12px] font-semibold hover:underline cursor-pointer"
                >
                  View appointments →
                </button>

              </div>

            </div>
          )}

        </div>


        {/* ===================================================
            ADMIN PROFILE
            =================================================== */}

        <div
          ref={profileRef}
          className="relative"
        >

          <button
            type="button"
            onClick={
              handleProfileClick
            }
            aria-label="Open admin profile"
            aria-expanded={
              profileOpen
            }
            className="flex gap-[10px] items-center rounded-[10px] px-[7px] py-[5px] hover:bg-[#f4f7fb] transition-colors cursor-pointer"
          >

            <div className="relative shrink-0 size-[34px]">

              <img
                alt="Admin User"
                className="absolute block inset-0 size-full"
                src={imgAvatar}
              />

            </div>


            <div className="flex flex-col gap-[2px] items-start">

              <p className="font-bold text-[#142033] text-[13px] leading-none whitespace-nowrap">
                {userName}
              </p>

              <p className="font-normal text-[#7b899c] text-[10px] leading-none whitespace-nowrap">
                {userRole}
              </p>

            </div>

          </button>


          {profileOpen && (
            <div className="absolute right-0 top-[48px] z-50 w-[210px] bg-white border border-[#d8e1ec] rounded-[12px] shadow-[0px_8px_28px_0px_rgba(19,36,58,0.14)] overflow-hidden">

              <div className="px-[15px] py-[13px] border-b border-[#edf1f6]">

                <p className="font-bold text-[#142033] text-[13px]">
                  {userName}
                </p>

                <p className="text-[#7b899c] text-[10px] mt-[3px]">
                  {userRole}
                </p>

              </div>


              <button
                type="button"
                onClick={() => {
                  setProfileOpen(
                    false
                  );
                  navigate(
                    '/admin/settings'
                  );
                }}
                className="w-full text-left px-[15px] py-[11px] text-[12px] font-semibold text-[#526176] hover:bg-[#f4f7fb] hover:text-[#155ead] transition-colors cursor-pointer"
              >
                Admin Settings
              </button>


              <button
                type="button"
                onClick={() => {
                  setProfileOpen(
                    false
                  );
                  navigate(
                    '/admin/settings'
                  );
                }}
                className="w-full text-left px-[15px] py-[11px] text-[12px] font-semibold text-[#526176] hover:bg-[#f4f7fb] hover:text-[#155ead] transition-colors cursor-pointer"
              >
                Account Settings
              </button>


              <div className="border-t border-[#edf1f6]" />

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(
                    false
                  );

                  /*
                   * Keep logout behaviour here
                   * when admin authentication is
                   * connected.
                   */
                  navigate(
                    '/admin/login'
                  );
                }}
                className="w-full text-left px-[15px] py-[11px] text-[12px] font-semibold text-[#c53a45] hover:bg-[#fff3f4] transition-colors cursor-pointer"
              >
                Sign Out
              </button>

            </div>
          )}

        </div>


        {/* ===================================================
            SETTINGS
            =================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate('/admin/settings')
          }
          aria-label="Settings"
          className="relative shrink-0 size-[34px] rounded-[9px] flex items-center justify-center hover:bg-[#f4f7fb] transition-colors cursor-pointer"
        >

          <img
            alt="Settings"
            className="size-[19px]"
            src={imgSettings}
          />

        </button>


        {/* ===================================================
            DATE PICKER
            =================================================== */}

        <div className="relative">

          <label
            className="relative flex items-center gap-[7px] bg-[#f4f7fb] border border-[#d8e1ec] rounded-[9px] px-[10px] py-[8px] cursor-pointer hover:border-[#155ead] hover:bg-[#f0f6fc] transition-colors"
            title="Select date"
          >

            <span className="text-[#155ead] text-[13px]">
              📅
            </span>

            <span className="font-semibold text-[#526176] text-[11px] whitespace-nowrap">
              {formatDate(
                selectedDate
              )}
            </span>

            <input
              type="date"
              value={toDateInputValue(
                selectedDate
              )}
              onChange={
                handleDateChange
              }
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              aria-label="Select dashboard date"
            />

          </label>

        </div>

      </div>

    </div>
  );
}