import React from "react";
import { User, Settings, Clock, Bookmark, TrendingUp } from "lucide-react";
import { DRAWER_WIDTH } from "../config/constants";

interface SidebarItem {
  text: string;
  icon: React.ComponentType<any>;
  id: string;
}

const drawerItems: SidebarItem[] = [
  { text: "アカウント", icon: User, id: "account" },
  { text: "設定", icon: Settings, id: "settings" },
  { text: "検索履歴", icon: Clock, id: "history" },
  { text: "ブックマーク", icon: Bookmark, id: "bookmarks" },
  { text: "論文ネットワーク", icon: TrendingUp, id: "network" },
];

interface SidebarProps {
  isOpen: boolean;
  headerHeight: number;
  onItemClick: (itemId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  headerHeight,
  onItemClick
}) => {
  return (
    <>
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      
      <div
        className={`fixed left-0 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ 
          top: headerHeight, 
          height: `calc(100% - ${headerHeight}px)`,
          width: `${DRAWER_WIDTH}px`
        }}
      >
        <nav className="p-4 space-y-2">
          {drawerItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onItemClick(item.id)}
                className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-all duration-200 hover:translate-x-1 hover:shadow-sm"
                style={{
                  animationDelay: isOpen ? `${index * 50}ms` : "0ms",
                  animation: isOpen ? "slideInLeft 0.3s ease-out forwards" : "none",
                }}
              >
                <IconComponent className="mr-3 text-gray-600 transition-colors duration-200" size={20} />
                <span className="text-sm text-gray-700">{item.text}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};