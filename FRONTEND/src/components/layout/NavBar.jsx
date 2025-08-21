import React from "react";
import TaskManager from "../task-manager/TaskManager";
import { useDispatch, useSelector } from "react-redux";
import LogoutIcon from "../../../svg/logout";
const NavBar = () => {
  const user = useSelector((state) => state.auth.name);
  const dispatch = useDispatch();
  const handleLogout = () => {
    // eslint-disable-next-line no-undef
    dispatch(logout());
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
        <LogoutIcon />
      </button>
    </li>
  </ul>
</div>

      </header>
      <div className="bg-[#353434] pb-[949px] mt-20 justify-start">
        <TaskManager />
      </div>
    </>
  );
};

export default NavBar;


