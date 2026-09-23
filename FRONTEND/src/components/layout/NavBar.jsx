import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LogoutIcon from "../../../svg/logout";
import { authService } from "../../services/api";
const NavBar = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.name);
  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      navigate("/");
    }
  };
  return (
    <>
      <header className="p-7 text-2xl flex flex-row justify-between fixed top-0 w-full bg-[#212020] z-50 text-white">
        <div>
          <ul className="m-0 flex justify-center items-center gap-10">
            <li className="px-3 text-white font-semibold">TASK MANAGER</li>
          </ul>
        </div>
        <div className="flex justify-end relative">
          <ul className="flex items-center gap-4">
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-white text-2xl px-2 hover:text-gray-300 transition-colors"
              >
                <span>{user}</span>
                <span>
                  <LogoutIcon />
                </span>
              </button>
            </li>
          </ul>
        </div>
      </header>
      <div className="bg-[#353434] mt-20 justify-start">
      </div>
    </>
  );
};

export default NavBar;
