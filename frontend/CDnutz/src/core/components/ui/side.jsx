import { HelpCircle, Heart, MessagesSquare, Users, Home, Star } from 'lucide-react';

import LoginButton from './duplicate/loginPromptButton.jsx';


const menuItems = {
  "Menu"     : [

    { "icon"   : Home,
      "label"  : "Homepage",
      "active" : true
    },

    { "icon"   : Users,
      "label"  : "Discover Friends",
      "active" : false
    },

    { "icon"   : MessagesSquare,
      "label"  : "Community Forums",
      "active" : false
    },

    { "icon"   : HelpCircle,
      "label"  : "Guess the Game",
      "active" : false
    },
  ],

  "Personal" : [

    { "icon"   : Star,
      "label"  : "Favorites",
      "active" : false
    },

    { "icon"   : Heart,
      "label"  : "Wishlist",
      "active" : false,
    }
  ]
};


function Side({ menuOpen, menuClose }) {

  return (
    <>

      {menuOpen && (
        <div
          className = "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick   = {menuClose}
        />
      )}

      <aside
        className = {`fixed left-0 top-0 bottom-0 z-40 flex flex-col justify-between
                      pt-20 pb-4
                      bg-[var(--secondary-background)] border-[var(--border)]
                      overflow-x-hidden
                      ${menuOpen ? "w-[var(--side-width)] border-r" : "w-0 border-none"}
                      transition-all duration-300 ease-in-out`}
      >

        <nav className = "flex flex-col gap-8 w-64 px-4">
          {Object.entries(menuItems).map(([section, items]) => (
            <div key = {section}>

              <h2 className = "text-xs uppercase tracking-wider text-[var(--color-secondary)] mb-3 px-2">
                {section}
              </h2>

              <ul className = "flex flex-col gap-1">
                {items.map((item) => (
                  <li key = {item.label}>
                    <a
                      href      = "#"
                      className = {`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all whitespace-nowrap
                                    ${item.active
                                      ? "bg-[image:var(--accent-color)] text-white shadow-lg shadow-[var(--color-nav-active-shadow)]"
                                      : "text-[var(--color-primary)] hover:text-white hover:bg-[var(--interractive-background)]"
                                    }`}
                    >
                      <item.icon className = "w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>

            </div>
          ))}
        </nav>

        <div className = "md:hidden px-4 w-64">
          <LoginButton className = "block text-center" />
        </div>

      </aside>
    </>
  );
}

export default Side;
