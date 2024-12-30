import React, { useState, useEffect } from 'react';
import { Plus, Grip, X, Edit2, Trash2 } from 'lucide-react';

const TrelloBoard = () => {
  const [lists, setLists] = useState([
    { 
      id: 1, 
      title: 'To Do', 
      cards: [
        { id: '1-1', text: 'Strategic Planning', description: 'Review Q4 goals', priority: 'high', dueDate: '2024-12-31' },
        { id: '1-2', text: 'Budget Review', description: 'Analyze Q1 spending', priority: 'medium', dueDate: null }
      ]
    },
    { 
      id: 2, 
      title: 'In Progress', 
      cards: [
        { id: '2-1', text: 'Team Updates', description: 'Collect department reports', priority: 'high', dueDate: '2024-12-25' }
      ]
    },
    { 
      id: 3, 
      title: 'Done', 
      cards: [
        { id: '3-1', text: 'Meeting Prep', description: 'Prepare agenda items', priority: 'low', dueDate: null }
      ]
    }
  ]);

  const [newListTitle, setNewListTitle] = useState('');
  const [newCardTexts, setNewCardTexts] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggingOver, setDraggingOver] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [editingList, setEditingList] = useState(null);

  const listColors = ['bg-blue-100', 'bg-purple-100', 'bg-green-100', 'bg-yellow-100', 'bg-pink-100'];
  const priorityColors = {
    high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium' },
    low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low' }
  };

  const handleAddList = () => {
    if (newListTitle.trim()) {
      setLists([...lists, {
        id: Date.now(),
        title: newListTitle,
        cards: []
      }]);
      setNewListTitle('');
    }
  };

  const handleDeleteList = (listId) => {
    setLists(lists.filter(list => list.id !== listId));
  };

  const handleDeleteCard = (listId, cardId) => {
    setLists(lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          cards: list.cards.filter(card => card.id !== cardId)
        };
      }
      return list;
    }));
  };

  const handleAddCard = (listId) => {
    const cardText = newCardTexts[listId];
    if (cardText?.trim()) {
      setLists(lists.map(list => {
        if (list.id === listId) {
          const newCard = {
            id: `${listId}-${Date.now()}`,
            text: cardText.trim(),
            description: '',
            priority: 'medium',
            dueDate: null
          };
          return {
            ...list,
            cards: [...list.cards, newCard]
          };
        }
        return list;
      }));
      setNewCardTexts({ ...newCardTexts, [listId]: '' });
    }
  };

  const handleUpdateCard = (listId, cardId, updates) => {
    setLists(lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          cards: list.cards.map(card => 
            card.id === cardId ? { ...card, ...updates } : card
          )
        };
      }
      return list;
    }));
    setEditingCard(null);
  };

  const handleDragStart = (e, listId, cardIndex) => {
    setDraggedItem({ listId, cardIndex });
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    setDraggedItem(null);
    setDraggingOver(null);
    if (e.target) e.target.style.opacity = '1';
  };

  const handleDragOver = (e, listId, cardIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOver({ listId, cardIndex });
  };

  const handleDrop = (e, targetListId, targetIndex) => {
    e.preventDefault();
    if (!draggedItem) return;

    const sourceList = lists.find(list => list.id === draggedItem.listId);
    const sourceCard = sourceList.cards[draggedItem.cardIndex];

    setLists(lists.map(list => {
      if (list.id === draggedItem.listId) {
        const newCards = [...list.cards];
        newCards.splice(draggedItem.cardIndex, 1);

        if (list.id === targetListId) {
          const adjustedTargetIndex = draggedItem.cardIndex < targetIndex ? targetIndex - 1 : targetIndex;
          newCards.splice(adjustedTargetIndex, 0, sourceCard);
        }
        return { ...list, cards: newCards };
      }
      
      if (list.id === targetListId && list.id !== draggedItem.listId) {
        const newCards = [...list.cards];
        newCards.splice(targetIndex, 0, sourceCard);
        return { ...list, cards: newCards };
      }
      
      return list;
    }));

    setDraggedItem(null);
    setDraggingOver(null);
  };

  const isDropTarget = (listId, cardIndex) => {
    return draggingOver?.listId === listId && draggingOver?.cardIndex === cardIndex;
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Nepa GRL Management Meeting</h1>
      </div>

      <div className="flex items-start gap-6 overflow-x-auto min-h-[calc(100vh-8rem)]">
        {lists.map((list, listIndex) => (
          <div
            key={list.id}
            className={`${listColors[listIndex % listColors.length]} flex-shrink-0 w-72 rounded-lg shadow-sm`}
          >
            <div className="p-3 font-semibold text-gray-700 flex justify-between items-center">
              {editingList === list.id ? (
                <input
                  type="text"
                  className="w-full px-2 py-1 rounded border"
                  defaultValue={list.title}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      setLists(lists.map(l =>
                        l.id === list.id ? { ...l, title: e.target.value.trim() } : l
                      ));
                      setEditingList(null);
                    }
                  }}
                  autoFocus
                />
              ) : (
                <div
                  className="flex-1 cursor-pointer"
                  onDoubleClick={() => setEditingList(list.id)}
                >
                  {list.title}
                </div>
              )}
              <button
                onClick={() => handleDeleteList(list.id)}
                className="p-1 hover:bg-red-100 rounded"
              >
                <X size={16} className="text-gray-500 hover:text-red-500" />
              </button>
            </div>

            <div 
              className="p-2"
              onDragOver={(e) => handleDragOver(e, list.id, list.cards.length)}
              onDrop={(e) => handleDrop(e, list.id, list.cards.length)}
            >
              {list.cards.map((card, cardIndex) => (
                <div key={card.id}>
                  {isDropTarget(list.id, cardIndex) && (
                    <div className="h-2 bg-blue-200 rounded my-1" />
                  )}
                  
                  <div
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, list.id, cardIndex)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, list.id, cardIndex)}
                    onDrop={(e) => handleDrop(e, list.id, cardIndex)}
                    className="group bg-white p-3 rounded mb-2 shadow-sm hover:shadow-md transition-all cursor-move"
                  >
                    <div className="flex items-start gap-2">
                      <Grip className="w-4 h-4 mt-1 text-gray-400 opacity-0 group-hover:opacity-100" />
                      <div className="flex-1">
                        {editingCard === card.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              className="w-full px-2 py-1 rounded border"
                              defaultValue={card.text}
                              onBlur={(e) => handleUpdateCard(list.id, card.id, { text: e.target.value })}
                              autoFocus
                            />
                            <textarea
                              className="w-full px-2 py-1 rounded border text-sm"
                              placeholder="Add description..."
                              defaultValue={card.description}
                              onBlur={(e) => handleUpdateCard(list.id, card.id, { description: e.target.value })}
                              rows={2}
                            />
                            <select
                              className="w-full px-2 py-1 rounded border"
                              value={card.priority}
                              onChange={(e) => handleUpdateCard(list.id, card.id, { priority: e.target.value })}
                            >
                              {Object.entries(priorityColors).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                            <input
                              type="date"
                              className="w-full px-2 py-1 rounded border"
                              value={card.dueDate || ''}
                              onChange={(e) => handleUpdateCard(list.id, card.id, { dueDate: e.target.value })}
                            />
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-xs ${priorityColors[card.priority].bg} ${priorityColors[card.priority].text}`}>
                                {priorityColors[card.priority].label}
                              </span>
                              {card.dueDate && (
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  new Date(card.dueDate) < new Date() 
                                    ? 'bg-red-100 text-red-700' 
                                    : new Date(card.dueDate) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  Due: {new Date(card.dueDate).toLocaleDateString()}
                                </span>
                              )}
                              <span>{card.text}</span>
                            </div>
                            {card.description && (
                              <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => setEditingCard(editingCard === card.id ? null : card.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit2 size={14} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteCard(list.id, card.id)}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={14} className="text-gray-500 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-2">
                <input
                  type="text"
                  value={newCardTexts[list.id] || ''}
                  onChange={(e) => setNewCardTexts({
                    ...newCardTexts,
                    [list.id]: e.target.value
                  })}
                  placeholder="Add a card..."
                  className="w-full p-2 rounded border border-gray-200 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCard(list.id)}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex-shrink-0 w-72">
          <div className="bg-white/50 rounded-lg p-3">
            <input
              type="text"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="Add a list..."
              className="w-full p-2 rounded border border-gray-200 text-sm mb-2"
              onKeyPress={(e) => e.key === 'Enter' && handleAddList()}
            />
            <button
              onClick={handleAddList}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <Plus size={16} />
              Add List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrelloBoard;