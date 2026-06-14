import { useState } from "react";
import { motion } from "motion/react";
import {
  Users,
  PlusCircle,
  Trash2,
  Receipt
} from "lucide-react";
import { calculateGroupBalances } from "./groupUtils";
function GroupsPage({
  currentUser,
  groups,
  setGroups,
  selectedGroupId,
  setSelectedGroupId,
  prefCurrency,
  triggerToast,
  navigateToExpenses
}) {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState("Home");
  const [newGroupMembers, setNewGroupMembers] = useState(["Priya", "Aarav"]);
  const [newMemberInput, setNewMemberInput] = useState("");
  const saveGroupsState = (updatedGroups) => {
    setGroups(updatedGroups);
  };
  const activeGroup = groups.find((x) => x.id === selectedGroupId);
  return <div id="groups-page-container" className="space-y-8 animate-fade-in text-left max-w-7xl mx-auto px-4 md:px-12 py-4">
      {
    /* Page Header */
  }
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4" id="groups-header-section">
        <div>
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-extrabold">SplitSmart Vault Room</span>
          <h2 className="text-3xl font-bold tracking-tight text-white mt-1">
            Group Roster Control Center
          </h2>
          <p className="text-sm text-neutral-400 mt-1 font-light">
            Model shared entities, manage individual profiles, and link persistent account histories.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {
    /* Left Panel: Groups Listing Column */
  }
        <div id="groups-list-column" className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono text-neutral-400 uppercase tracking-wider font-bold">
              My Persistent Groups
            </h3>
            <button
    id="btn-trigger-create-group"
    onClick={() => {
      setNewGroupName("");
      setNewMemberInput("");
      setNewGroupMembers(["Priya", "Aarav"]);
      setShowCreateGroup(!showCreateGroup);
    }}
    style={{ minHeight: "44px" }}
    className={`text-xs font-mono px-4 py-2 rounded-xl flex items-center space-x-1.5 border font-bold uppercase transition-all cursor-pointer ${showCreateGroup ? "bg-red-950/40 border-red-900/80 text-red-400" : "bg-indigo-950/40 border-indigo-900/50 text-indigo-400 hover:bg-indigo-950/80"}`}
  >
              <PlusCircle className="w-4 h-4" />
              <span>{showCreateGroup ? "Cancel" : "Create Group"}</span>
            </button>
          </div>

          {
    /* Create New Group Controls */
  }
          {showCreateGroup && <motion.div
    id="create-group-panel"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-zinc-950 border border-indigo-950 p-5 rounded-2xl space-y-4 shadow-xl text-left"
  >
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Group Name</span>
                <input
    id="input-create-group-name"
    type="text"
    value={newGroupName}
    onChange={(e) => setNewGroupName(e.target.value)}
    placeholder="e.g. Roommates Rent, Family Trip"
    className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
  />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Category</span>
                  <select
    id="select-create-group-category"
    value={newGroupCategory}
    onChange={(e) => setNewGroupCategory(e.target.value)}
    className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
  >
                    <option value="Home">🏠 Home & Rent</option>
                    <option value="Trip">✈️ Travel & Trip</option>
                    <option value="Office">💼 Work/Office</option>
                    <option value="Social">🍻 Social Group</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Roster Presets</span>
                  <button
    id="btn-import-roster-preset"
    type="button"
    style={{ minHeight: "38px" }}
    onClick={() => {
      if (newGroupCategory === "Home") setNewGroupMembers(["Priya", "Aarav", "Rohan", "Sneha"]);
      if (newGroupCategory === "Trip") setNewGroupMembers(["Dev", "Ananya", "Kabir"]);
      if (newGroupCategory === "Office") setNewGroupMembers(["Arjun", "Neha", "Amit"]);
      if (newGroupCategory === "Social") setNewGroupMembers(["Yash", "Rahul", "Rohit"]);
      triggerToast("Loaded group roster preset names!");
    }}
    className="w-full bg-indigo-950/30 border border-indigo-900/60 hover:bg-indigo-900/40 text-[10px] py-2 rounded-lg text-indigo-400 font-bold transition-all cursor-pointer text-center"
  >
                    Fill Names
                  </button>
                </div>
              </div>

              {
    /* Member Roster Form */
  }
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
                  Roster Members ({newGroupMembers.length})
                </span>
                <div className="flex flex-wrap gap-1.5 p-2 bg-black/40 rounded-lg min-h-[36px] border border-neutral-900">
                  {newGroupMembers.map((m) => <span id={`roster-pill-${m}`} key={m} className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] px-2.5 py-1 rounded-full flex items-center space-x-1">
                      <span>{m}</span>
                      <button
    type="button"
    onClick={() => setNewGroupMembers(newGroupMembers.filter((x) => x !== m))}
    className="text-red-400 hover:text-red-500 font-extrabold ml-1 cursor-pointer"
  >
                        ×
                      </button>
                    </span>)}
                  {newGroupMembers.length === 0 && <span className="text-[10px] text-zinc-600 font-light">Add at least 1 member</span>}
                </div>

                <div className="flex items-center gap-2">
                  <input
    id="input-create-roster-member"
    type="text"
    placeholder="Enter Name..."
    value={newMemberInput}
    onChange={(e) => setNewMemberInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const val = newMemberInput.trim();
        if (val && !newGroupMembers.includes(val)) {
          setNewGroupMembers([...newGroupMembers, val]);
          setNewMemberInput("");
        }
      }
    }}
    className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-lg text-xs text-white placeholder-zinc-650 focus:outline-none"
  />
                  <button
    id="btn-add-roster-member"
    type="button"
    style={{ minHeight: "34px" }}
    onClick={() => {
      const val = newMemberInput.trim();
      if (val && !newGroupMembers.includes(val)) {
        setNewGroupMembers([...newGroupMembers, val]);
        setNewMemberInput("");
      }
    }}
    className="bg-neutral-800 hover:bg-neutral-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
  >
                    Add
                  </button>
                </div>
              </div>

              <button
    id="btn-confirm-group-genesis"
    onClick={() => {
      if (!newGroupName.trim()) {
        triggerToast("Please provide a name for the new group!");
        return;
      }
      if (newGroupMembers.length < 2) {
        triggerToast("Groups must include at least 2 participants.");
        return;
      }
      const addedId = `group-${Date.now()}`;
      const created = {
        id: addedId,
        name: newGroupName.trim(),
        category: newGroupCategory,
        members: newGroupMembers,
        expenses: []
      };
      const updated = [created, ...groups];
      saveGroupsState(updated);
      setSelectedGroupId(addedId);
      setShowCreateGroup(false);
      triggerToast(`Successfully generated new Vault group "${created.name}"!`);
    }}
    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-extrabold uppercase rounded-lg tracking-widest cursor-pointer transition-all"
  >
                Confirm Group Genesis
              </button>
            </motion.div>}

          {
    /* List of active groups */
  }
          <div className="space-y-3" id="groups-list-cards-container">
            {groups.map((g, gIdx) => {
    const isSelected = selectedGroupId === g.id;
    const totalsObj = calculateGroupBalances(g);
    const categoryIcon = g.category === "Home" ? "🏠" : g.category === "Trip" ? "✈️" : g.category === "Office" ? "💼" : "🍻";
    return <motion.div
      key={g.id}
      id={`dashboard-group-card-${g.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: gIdx * 0.04 }}
      onClick={() => {
        setSelectedGroupId(g.id);
      }}
      className={`p-4.5 border rounded-2xl text-left cursor-pointer transition-all hover:bg-white/5 relative group/itemcard shadow-md ${isSelected ? "bg-neutral-900 border-indigo-500 shadow-indigo-505 shadow-inner" : "bg-zinc-950 border-neutral-900"}`}
    >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-sm">{categoryIcon}</span>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{g.name}</h4>
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono text-zinc-500 font-bold uppercase">
                        <span>{g.members.length} members</span>
                        <span>•</span>
                        <span>{g.expenses.length} claims</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block font-bold">Spent</span>
                      <span className="text-xs font-extrabold text-white font-mono">
                        {prefCurrency}{totalsObj.totalExpenses.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {
      /* Quick indicator of group balance flow */
    }
                  <div className="mt-3 pt-2.5 border-t border-neutral-900/60 flex items-center justify-between text-[9px] font-mono">
                    <span className="text-zinc-500 font-medium truncate max-w-[140px]">
                      {g.members.slice(0, 3).join(", ")}{g.members.length > 3 ? "..." : ""}
                    </span>
                    {totalsObj.settlements.length > 0 ? <span className="text-indigo-400 font-bold uppercase bg-indigo-950/20 px-1.5 py-0.5 rounded border border-indigo-900/30">
                        {totalsObj.settlements.length} settlement loops
                      </span> : <span className="text-emerald-500 font-bold uppercase bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/30">
                        Perfect Balance
                      </span>}
                  </div>

                  {
      /* Trash Group button */
    }
                  <button
      id={`btn-delete-group-${g.id}`}
      onClick={(e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete the group "${g.name}"?`)) {
          const filterGroups = groups.filter((x) => x.id !== g.id);
          saveGroupsState(filterGroups);
          if (selectedGroupId === g.id && filterGroups.length > 0) {
            setSelectedGroupId(filterGroups[0].id);
          }
          triggerToast(`Deleted standard group "${g.name}".`);
        }
      }}
      className="absolute top-3 right-3 text-zinc-650 hover:text-red-400 p-1 opacity-0 group-hover/itemcard:opacity-100 transition-opacity rounded cursor-pointer"
      title="Remove Group"
    >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>;
  })}

            {groups.length === 0 && <div className="p-8 text-center text-zinc-600 bg-zinc-950/40 border border-dashed border-neutral-900 rounded-2xl font-light text-xs">
                No persistent group vaults. Create one above to track team scenarios.
              </div>}
          </div>
        </div>

        {
    /* Right Panel: Selected Group details, rosters and profiles */
  }
        <div id="group-details-panel" className="lg:col-span-8 bg-zinc-950 border border-neutral-900 rounded-2xl p-6 min-h-[480px]">
          {!activeGroup ? <div className="flex flex-col items-center justify-center p-12 text-center h-full space-y-3 mt-12">
              <Users className="w-8 h-8 text-zinc-700 animate-pulse" />
              <h4 className="text-sm font-bold text-white uppercase">No Group Selected</h4>
              <p className="text-xs text-zinc-500 font-light max-w-sm">
                Select or build an active group on the left checklist panel to manage its persistent member roster profiles.
              </p>
            </div> : <motion.div
    key={activeGroup.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="space-y-6 text-left animate-fade-in relative"
  >
              {
    /* Selected Group Header */
  }
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-900" id="selected-group-header">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-indigo-950 border border-indigo-900 text-indigo-400 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase">
                      {activeGroup.category} Group
                    </span>
                    <span className="text-xs text-zinc-500 font-mono font-bold">•</span>
                    <span className="text-xs font-mono text-zinc-500 font-bold uppercase">{activeGroup.members.length} members</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{activeGroup.name}</h3>
                </div>

                <button
    id="btn-navigate-to-ledger"
    style={{ minHeight: "44px" }}
    type="button"
    onClick={navigateToExpenses}
    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all cursor-pointer flex items-center space-x-1 shadow-md shadow-emerald-950/20"
  >
                  <Receipt className="w-4 h-4" />
                  <span>Configure Group Ledger</span>
                </button>
              </div>

              {
    /* Add member controls */
  }
              <div className="bg-neutral-900/40 border border-neutral-900 p-5 rounded-2xl space-y-3" id="add-member-control-box">
                <h4 className="text-xs font-mono text-zinc-400 uppercase font-bold tracking-wider">
                  Add New Member to Group Roster
                </h4>
                <div className="flex items-center gap-2">
                  <input
    id="input-member-roster-add-name"
    type="text"
    placeholder="Enter member's name..."
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const val = e.target.value.trim();
        if (val) {
          if (activeGroup.members.includes(val)) {
            triggerToast("This member is already in original list!");
            return;
          }
          const updated = groups.map((g) => {
            if (g.id === activeGroup.id) {
              return { ...g, members: [...g.members, val] };
            }
            return g;
          });
          saveGroupsState(updated);
          triggerToast(`Successfully added "${val}" profile!`);
          e.target.value = "";
        }
      }
    }}
    className="w-full bg-neutral-950 border border-neutral-800 px-3.5 py-2 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
  />
                  <button
    id="btn-member-roster-submit"
    type="button"
    style={{ minHeight: "38px" }}
    onClick={(e) => {
      const inputEl = document.getElementById("input-member-roster-add-name");
      const val = inputEl?.value.trim();
      if (val) {
        if (activeGroup.members.includes(val)) {
          triggerToast("This member is already in the roster!");
          return;
        }
        const updated = groups.map((g) => {
          if (g.id === activeGroup.id) {
            return { ...g, members: [...g.members, val] };
          }
          return g;
        });
        saveGroupsState(updated);
        triggerToast(`Added "${val}" to ${activeGroup.name}!`);
        inputEl.value = "";
      } else {
        triggerToast("Provide a valid profile name!");
      }
    }}
    className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all shrink-0"
  >
                    Add Member
                  </button>
                </div>
              </div>

              {
    /* Members list */
  }
              <div className="space-y-3" id="active-member-profiles-section">
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
                  Active Member Profiles Details ({activeGroup.members.length})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeGroup.members.map((member, mIdx) => {
    const paidSum = activeGroup.expenses.filter((x) => x.payer === member).reduce((s, e) => s + e.amount, 0);
    return <motion.div
      key={member}
      id={`member-profile-card-${member}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: mIdx * 0.03 }}
      className="bg-neutral-900/40 border border-neutral-900 rounded-xl p-4 flex justify-between items-center group/member relative text-left"
    >
                        <div className="space-y-1">
                          <span className="text-sm font-bold text-white block leading-snug">{member}</span>
                          <span className="text-[10px] font-mono text-zinc-400 block leading-none">
                            Total Paid: {prefCurrency}{paidSum.toFixed(2)}
                          </span>
                        </div>

                        <button
      id={`btn-remove-member-${member}`}
      type="button"
      onClick={() => {
        if (activeGroup.members.length <= 2) {
          triggerToast("A group must contain at least 2 members.");
          return;
        }
        if (confirm(`Remove "${member}"? This also purges expenses logged by ${member}.`)) {
          const updatedExpenses = activeGroup.expenses.filter((x) => x.payer !== member);
          const updatedMembers = activeGroup.members.filter((x) => x !== member);
          const updated = groups.map((g) => {
            if (g.id === activeGroup.id) {
              return { ...g, members: updatedMembers, expenses: updatedExpenses };
            }
            return g;
          });
          saveGroupsState(updated);
          triggerToast(`Successfully deleted ${member} profile.`);
        }
      }}
      className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-neutral-950 transition-all cursor-pointer text-[10px] uppercase font-mono font-bold leading-none"
    >
                          Remove
                        </button>
                      </motion.div>;
  })}
                </div>
              </div>

            </motion.div>}
        </div>
      </div>
    </div>;
}
export {
  GroupsPage
};
