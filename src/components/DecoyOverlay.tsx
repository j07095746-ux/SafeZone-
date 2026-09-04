import React from 'react';
import { CloakPreset } from '../types';
import { Folder, MoreVertical, Search, Grid, HelpCircle, User, CheckCircle, Calendar, Plus, BookOpen } from 'lucide-react';

interface DecoyOverlayProps {
  onDismiss: () => void;
  preset: CloakPreset;
}

export const DecoyOverlay: React.FC<DecoyOverlayProps> = ({ onDismiss, preset }) => {
  const isDrive = preset === 'drive';

  return (
    <div
      id="safezone-decoy-screen"
      className="fixed inset-0 z-[99999] bg-white text-gray-800 font-sans select-none overflow-y-auto"
      onKeyDown={e => {
        if (e.key === 'Escape') onDismiss();
      }}
      tabIndex={0}
    >
      {/* Top Decoy Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onDismiss}
            className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
            title="Click to resume SafeZone"
          >
            <div className="w-5 h-0.5 bg-gray-600 mb-1" />
            <div className="w-5 h-0.5 bg-gray-600 mb-1" />
            <div className="w-5 h-0.5 bg-gray-600" />
          </button>

          <div className="flex items-center gap-2">
            {isDrive ? (
              <img
                src="https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png"
                alt="Drive"
                className="w-7 h-7"
              />
            ) : (
              <img
                src="https://ssl.gstatic.com/classroom/favicon.png"
                alt="Classroom"
                className="w-7 h-7"
              />
            )}
            <span className="text-xl font-normal text-gray-700">
              {isDrive ? 'Google Drive' : 'Google Classroom'}
            </span>
          </div>
        </div>

        {/* Fake Search bar */}
        <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2 w-96 max-w-md">
          <Search className="w-4 h-4 text-gray-500 mr-3" />
          <input
            type="text"
            placeholder={isDrive ? 'Search in Drive' : 'Search classes, work...'}
            className="bg-transparent border-none outline-none text-sm w-full text-gray-700"
            readOnly
          />
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <Grid className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            S
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isDrive ? (
        /* Google Drive Decoy */
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Suggested Files</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition bg-white">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-800">AP Literature Syllabus.pdf</span>
              </div>
              <p className="text-xs text-gray-500">Opened today at 10:15 AM</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition bg-white">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-gray-800">Algebra II Formulas - Sheet</span>
              </div>
              <p className="text-xs text-gray-500">Edited yesterday</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Folder className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-semibold text-gray-800">Chemistry Lab Notes</span>
              </div>
              <p className="text-xs text-gray-500">Shared with Mrs. Robinson</p>
            </div>
          </div>

          <h3 className="text-md font-medium text-gray-700 mb-3">Folders</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['English Language & Comp', 'US History Honors', 'AP Physics Lab', 'Spanish III Projects'].map(
              (name, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Folder className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700 truncate">{name}</span>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        /* Google Classroom Decoy */
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-gray-800">My Classes (Period 1-6)</h2>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 text-xs text-blue-600 font-medium px-3 py-1.5 rounded-full hover:bg-blue-50 border border-blue-200">
                <Calendar className="w-4 h-4" /> To-do List
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Class Card 1 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between">
              <div className="bg-emerald-700 text-white p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg leading-tight hover:underline cursor-pointer">
                      AP European History
                    </h3>
                    <p className="text-xs opacity-90">Period 2 • Mr. Thompson</p>
                  </div>
                  <MoreVertical className="w-4 h-4 cursor-pointer" />
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between text-xs text-gray-600 min-h-[100px]">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Due Friday, 11:59 PM</p>
                  <p className="text-gray-600">Chapter 14 DBQ: Industrial Revolution Response</p>
                </div>
                <div className="flex justify-end pt-3 border-t border-gray-100 mt-3">
                  <span className="text-blue-600 hover:underline cursor-pointer">View classwork</span>
                </div>
              </div>
            </div>

            {/* Class Card 2 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between">
              <div className="bg-blue-700 text-white p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg leading-tight hover:underline cursor-pointer">
                      Honors Calculus BC
                    </h3>
                    <p className="text-xs opacity-90">Period 4 • Dr. Miller</p>
                  </div>
                  <MoreVertical className="w-4 h-4 cursor-pointer" />
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between text-xs text-gray-600 min-h-[100px]">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Due Tomorrow</p>
                  <p className="text-gray-600">Section 4.3 Integration by Parts Problem Set</p>
                </div>
                <div className="flex justify-end pt-3 border-t border-gray-100 mt-3">
                  <span className="text-blue-600 hover:underline cursor-pointer">View classwork</span>
                </div>
              </div>
            </div>

            {/* Class Card 3 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between">
              <div className="bg-slate-700 text-white p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg leading-tight hover:underline cursor-pointer">
                      AP Chemistry & Lab
                    </h3>
                    <p className="text-xs opacity-90">Period 5 • Mrs. Ramirez</p>
                  </div>
                  <MoreVertical className="w-4 h-4 cursor-pointer" />
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between text-xs text-gray-600 min-h-[100px]">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Upcoming Quiz</p>
                  <p className="text-gray-600">Thermodynamics & Reaction Kinetics Exam</p>
                </div>
                <div className="flex justify-end pt-3 border-t border-gray-100 mt-3">
                  <span className="text-blue-600 hover:underline cursor-pointer">View classwork</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discreet Exit Hint */}
      <div className="fixed bottom-3 right-3">
        <button
          onClick={onDismiss}
          className="text-[11px] text-gray-400 hover:text-gray-700 bg-white/90 border border-gray-200 px-3 py-1.5 rounded-full shadow-sm cursor-pointer transition"
        >
          [Press Escape or Click here to return to SafeZone]
        </button>
      </div>
    </div>
  );
};
