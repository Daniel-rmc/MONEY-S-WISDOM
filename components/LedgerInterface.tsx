
import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Rocket, PartyPopper, Plus, History, Save, Lock, Target, Minus, CheckCircle, Trash2 } from 'lucide-react';
import { FundType, LedgerState, Transaction, DreamGoal } from '../types';

interface LedgerInterfaceProps {
  onClose: () => void;
}

const STORAGE_KEY = 'moneys-wisdom-ledger-v1';

const INITIAL_STATE: LedgerState = {
  freedomFund: 0,
  dreamFund: 0,
  playFund: 0,
  transactions: [],
  dreamGoals: [],
  percentages: {
    freedom: 50,
    dream: 40,
    play: 10
  }
};

type ModalType = 'NONE' | 'ADD_GOAL' | 'REALIZE_DREAM' | 'SPEND_PLAY';

export const LedgerInterface: React.FC<LedgerInterfaceProps> = ({ onClose }) => {
  const [state, setState] = useState<LedgerState>(INITIAL_STATE);
  const [incomeInput, setIncomeInput] = useState<string>('');
  
  // Modal State
  const [activeModal, setActiveModal] = useState<ModalType>('NONE');
  const [modalInputAmount, setModalInputAmount] = useState('');
  const [modalInputText, setModalInputText] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');

  // Allocation inputs
  const [allocations, setAllocations] = useState({
    freedom: 0,
    dream: 0,
    play: 0
  });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration logic for older versions
        if (!parsed.percentages) parsed.percentages = INITIAL_STATE.percentages;
        if (!parsed.dreamGoals) parsed.dreamGoals = [];
        // Ensure transactions have a type
        parsed.transactions = parsed.transactions.map((t: any) => ({
          ...t,
          type: t.type || 'DEPOSIT'
        }));
        setState(parsed);
      } catch (e) {
        console.error("Failed to parse ledger data", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateAllocations = (amount: number, currentPercentages: LedgerState['percentages']) => {
    setAllocations({
      freedom: Math.round(amount * (currentPercentages.freedom / 100)),
      dream: Math.round(amount * (currentPercentages.dream / 100)),
      play: Math.round(amount * (currentPercentages.play / 100))
    });
  };

  const handleIncomeChange = (val: string) => {
    setIncomeInput(val);
    const amount = parseFloat(val) || 0;
    updateAllocations(amount, state.percentages);
  };

  const handlePercentageChange = (type: keyof LedgerState['percentages'], val: string) => {
    const numVal = parseFloat(val);
    const validVal = isNaN(numVal) ? 0 : numVal;
    
    const newPercentages = { ...state.percentages, [type]: validVal };
    
    setState(prev => ({
      ...prev,
      percentages: newPercentages
    }));

    const amount = parseFloat(incomeInput) || 0;
    updateAllocations(amount, newPercentages);
  };

  // --- Actions ---

  const executeAllocation = () => {
    const newTransactions: Transaction[] = [];
    const timestamp = Date.now();
    const idBase = timestamp.toString();

    if (allocations.freedom > 0) newTransactions.push({ id: idBase + '-1', amount: allocations.freedom, fundType: 'FREEDOM', type: 'DEPOSIT', description: '收入分配', date: timestamp });
    if (allocations.dream > 0) newTransactions.push({ id: idBase + '-2', amount: allocations.dream, fundType: 'DREAM', type: 'DEPOSIT', description: '收入分配', date: timestamp });
    if (allocations.play > 0) newTransactions.push({ id: idBase + '-3', amount: allocations.play, fundType: 'PLAY', type: 'DEPOSIT', description: '收入分配', date: timestamp });

    setState(prev => ({
      ...prev,
      freedomFund: prev.freedomFund + allocations.freedom,
      dreamFund: prev.dreamFund + allocations.dream,
      playFund: prev.playFund + allocations.play,
      transactions: [...newTransactions, ...prev.transactions]
    }));

    setIncomeInput('');
    setAllocations({ freedom: 0, dream: 0, play: 0 });
  };

  const handleAddGoal = () => {
    if (!modalInputText || !modalInputAmount) return;
    const newGoal: DreamGoal = {
      id: Date.now().toString(),
      name: modalInputText,
      cost: parseFloat(modalInputAmount),
      isAchieved: false
    };
    setState(prev => ({
      ...prev,
      dreamGoals: [...prev.dreamGoals, newGoal]
    }));
    closeModal();
  };

  const handleSpendPlay = () => {
    const amount = parseFloat(modalInputAmount);
    if (!amount || amount > state.playFund) return;

    const transaction: Transaction = {
      id: Date.now().toString(),
      amount: amount,
      fundType: 'PLAY',
      type: 'WITHDRAWAL',
      description: modalInputText || '乐享支出',
      date: Date.now()
    };

    setState(prev => ({
      ...prev,
      playFund: prev.playFund - amount,
      transactions: [transaction, ...prev.transactions]
    }));
    closeModal();
  };

  const handleRealizeDream = () => {
    const goal = state.dreamGoals.find(g => g.id === selectedGoalId);
    if (!goal) return;
    
    if (goal.cost > state.dreamFund) {
      alert("梦想基金余额不足以实现这个梦想，继续加油存钱吧！");
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      amount: goal.cost,
      fundType: 'DREAM',
      type: 'WITHDRAWAL',
      description: `实现梦想: ${goal.name}`,
      date: Date.now()
    };

    setState(prev => ({
      ...prev,
      dreamFund: prev.dreamFund - goal.cost,
      dreamGoals: prev.dreamGoals.map(g => g.id === goal.id ? { ...g, isAchieved: true, achievedDate: Date.now() } : g),
      transactions: [transaction, ...prev.transactions]
    }));
    closeModal();
  };

  const deleteGoal = (id: string) => {
    if(confirm("确定要删除这个梦想目标吗？")) {
      setState(prev => ({
        ...prev,
        dreamGoals: prev.dreamGoals.filter(g => g.id !== id)
      }));
    }
  };

  const closeModal = () => {
    setActiveModal('NONE');
    setModalInputAmount('');
    setModalInputText('');
    setSelectedGoalId('');
  };

  const totalBalance = state.freedomFund + state.dreamFund + state.playFund;
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString();

  return (
    <div className="fixed inset-0 bg-amber-50 z-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-8 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">我的财富账本</h2>
            <p className="text-amber-600">分配你的金鹅，养肥你的梦想</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white hover:bg-amber-100 rounded-full shadow-sm transition-colors border border-amber-200">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Total Wealth Summary */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg mb-8 flex items-center justify-between">
          <div>
            <p className="text-amber-100 font-medium mb-1">总资产 (Total Wealth)</p>
            <h3 className="text-4xl font-bold">¥ {totalBalance.toLocaleString()}</h3>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Fund Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Freedom Fund (LOCKED) */}
          <div className="bg-white rounded-xl p-6 shadow-md border-t-4 border-yellow-500 flex flex-col h-full relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 bg-gray-100 p-8 rounded-full opacity-20 group-hover:opacity-40 transition-opacity">
                <Lock className="w-16 h-16 text-gray-500" />
             </div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <h4 className="font-bold text-gray-800">财务自由基金</h4>
            </div>
            <p className="text-sm text-gray-500 mb-2">养金鹅 ({state.percentages.freedom}%)</p>
            <p className="text-2xl font-bold text-gray-900 mb-4">¥ {state.freedomFund.toLocaleString()}</p>
            <div className="mt-auto pt-4 border-t border-gray-100">
                <p className="text-xs text-red-400 flex items-center">
                    <Lock className="w-3 h-3 mr-1" />
                    金鹅不可杀 (不可支出)
                </p>
            </div>
          </div>

          {/* Dream Fund */}
          <div className="bg-white rounded-xl p-6 shadow-md border-t-4 border-purple-500 flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Rocket className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-800">梦想基金</h4>
            </div>
            <p className="text-sm text-gray-500 mb-2">为目标储蓄 ({state.percentages.dream}%)</p>
            <p className="text-2xl font-bold text-gray-900 mb-4">¥ {state.dreamFund.toLocaleString()}</p>
            
            {/* Dream Goals Mini List */}
            <div className="space-y-2 mb-4 flex-grow">
               {state.dreamGoals.filter(g => !g.isAchieved).length === 0 && (
                   <p className="text-xs text-gray-400 italic">还没有设定梦想目标...</p>
               )}
               {state.dreamGoals.filter(g => !g.isAchieved).slice(0,2).map(g => (
                   <div key={g.id} className="flex justify-between items-center text-xs bg-purple-50 p-2 rounded">
                       <span className="truncate max-w-[60%]">{g.name}</span>
                       <span className={`font-bold ${state.dreamFund >= g.cost ? 'text-green-600' : 'text-gray-500'}`}>
                           {state.dreamFund >= g.cost ? '可实现' : `¥${g.cost}`}
                       </span>
                   </div>
               ))}
               {state.dreamGoals.filter(g => !g.isAchieved).length > 2 && (
                   <p className="text-xs text-center text-purple-500">...</p>
               )}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2">
                <button 
                    onClick={() => setActiveModal('ADD_GOAL')}
                    className="flex justify-center items-center py-2 border border-purple-200 text-purple-600 rounded-lg text-xs hover:bg-purple-50 font-bold"
                >
                    <Plus className="w-3 h-3 mr-1" /> 加梦想
                </button>
                <button 
                    onClick={() => setActiveModal('REALIZE_DREAM')}
                    disabled={state.dreamGoals.filter(g => !g.isAchieved).length === 0}
                    className="flex justify-center items-center py-2 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700 disabled:bg-gray-300 font-bold"
                >
                    <Target className="w-3 h-3 mr-1" /> 实现梦想
                </button>
            </div>
          </div>

          {/* Play Fund */}
          <div className="bg-white rounded-xl p-6 shadow-md border-t-4 border-pink-500 flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-pink-100 p-2 rounded-lg">
                <PartyPopper className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="font-bold text-gray-800">乐享基金</h4>
            </div>
            <p className="text-sm text-gray-500 mb-2">奖励自己 ({state.percentages.play}%)</p>
            <p className="text-2xl font-bold text-gray-900 mb-4">¥ {state.playFund.toLocaleString()}</p>
            <div className="mt-auto">
                <button 
                    onClick={() => setActiveModal('SPEND_PLAY')}
                    className="w-full flex justify-center items-center py-2 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600 font-bold shadow-sm"
                >
                    <Minus className="w-4 h-4 mr-1" /> 
                    乐享生活 (支出)
                </button>
            </div>
          </div>
        </div>

        {/* Main Layout: Split into Income Allocator & Goals/History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Allocator */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-amber-100 h-fit">
                <div className="flex items-center space-x-2 mb-6">
                    <Plus className="w-5 h-5 text-amber-500" />
                    <h3 className="text-xl font-bold text-gray-800">分配收入</h3>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">输入收入总额</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-400">¥</span>
                            <input 
                            type="number" 
                            value={incomeInput}
                            onChange={(e) => handleIncomeChange(e.target.value)}
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-lg"
                            placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                        {/* Freedom Input */}
                        <div className="flex items-center space-x-4">
                            <div className="w-24 flex-shrink-0">
                                <label className="text-xs font-bold text-yellow-600 block">自由 ({state.percentages.freedom}%)</label>
                            </div>
                            <div className="flex-grow">
                                <input 
                                    type="number" 
                                    value={allocations.freedom}
                                    onChange={(e) => setAllocations({...allocations, freedom: parseFloat(e.target.value) || 0})}
                                    className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-yellow-400 outline-none" 
                                />
                            </div>
                             <input 
                                type="number" 
                                value={state.percentages.freedom}
                                onChange={(e) => handlePercentageChange('freedom', e.target.value)}
                                className="w-12 p-1 text-center border border-gray-200 rounded text-xs text-gray-500" 
                                title="调整比例"
                            />
                        </div>

                        {/* Dream Input */}
                        <div className="flex items-center space-x-4">
                            <div className="w-24 flex-shrink-0">
                                <label className="text-xs font-bold text-purple-600 block">梦想 ({state.percentages.dream}%)</label>
                            </div>
                            <div className="flex-grow">
                                <input 
                                    type="number" 
                                    value={allocations.dream}
                                    onChange={(e) => setAllocations({...allocations, dream: parseFloat(e.target.value) || 0})}
                                    className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-purple-400 outline-none" 
                                />
                            </div>
                            <input 
                                type="number" 
                                value={state.percentages.dream}
                                onChange={(e) => handlePercentageChange('dream', e.target.value)}
                                className="w-12 p-1 text-center border border-gray-200 rounded text-xs text-gray-500" 
                                title="调整比例"
                            />
                        </div>

                        {/* Play Input */}
                        <div className="flex items-center space-x-4">
                            <div className="w-24 flex-shrink-0">
                                <label className="text-xs font-bold text-pink-600 block">乐享 ({state.percentages.play}%)</label>
                            </div>
                            <div className="flex-grow">
                                <input 
                                    type="number" 
                                    value={allocations.play}
                                    onChange={(e) => setAllocations({...allocations, play: parseFloat(e.target.value) || 0})}
                                    className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-pink-400 outline-none" 
                                />
                            </div>
                            <input 
                                type="number" 
                                value={state.percentages.play}
                                onChange={(e) => handlePercentageChange('play', e.target.value)}
                                className="w-12 p-1 text-center border border-gray-200 rounded text-xs text-gray-500" 
                                title="调整比例"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={executeAllocation}
                        disabled={!parseFloat(incomeInput)}
                        className="w-full flex justify-center items-center space-x-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md"
                    >
                        <Save className="w-5 h-5" />
                        <span>存入资金 (Deposit)</span>
                    </button>
                </div>
            </div>

            {/* Right Column: Transaction History & Goals */}
            <div className="space-y-6">
                
                {/* Transaction History */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
                    <div className="flex items-center space-x-2 mb-4">
                        <History className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-bold text-gray-700">账单记录</h3>
                    </div>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {state.transactions.length === 0 ? (
                        <p className="text-gray-400 text-center py-4 text-sm">暂无记录</p>
                        ) : (
                        state.transactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-2 h-2 rounded-full ${
                                    t.fundType === 'FREEDOM' ? 'bg-yellow-500' :
                                    t.fundType === 'DREAM' ? 'bg-purple-500' : 'bg-pink-500'
                                    }`} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{t.description}</p>
                                        <p className="text-xs text-gray-400">{formatDate(t.date)}</p>
                                    </div>
                                </div>
                                <span className={`font-bold text-sm ${t.type === 'WITHDRAWAL' ? 'text-red-500' : 'text-green-600'}`}>
                                    {t.type === 'WITHDRAWAL' ? '-' : '+'} ¥{t.amount.toLocaleString()}
                                </span>
                            </div>
                        ))
                        )}
                    </div>
                </div>

                {/* Dream Goals Full List */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
                     <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center space-x-2">
                             <Target className="w-5 h-5 text-purple-500" />
                             <h3 className="text-lg font-bold text-gray-700">我的梦想清单</h3>
                         </div>
                     </div>
                     <div className="space-y-3">
                        {state.dreamGoals.length === 0 && <p className="text-sm text-gray-400 text-center">快去添加你的第一个梦想吧！</p>}
                        {state.dreamGoals.map(goal => (
                            <div key={goal.id} className={`p-3 rounded-lg border flex justify-between items-center ${goal.isAchieved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`font-bold ${goal.isAchieved ? 'text-green-800 line-through' : 'text-gray-800'}`}>{goal.name}</span>
                                        {goal.isAchieved && <CheckCircle className="w-4 h-4 text-green-600" />}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        需要: ¥{goal.cost} {goal.isAchieved && `(已于 ${formatDate(goal.achievedDate!)} 实现)`}
                                    </p>
                                </div>
                                {!goal.isAchieved ? (
                                    <button 
                                        onClick={() => deleteGoal(goal.id)}
                                        className="text-gray-300 hover:text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <span className="text-xs font-bold text-green-600 px-2 py-1 bg-green-100 rounded">已实现</span>
                                )}
                            </div>
                        ))}
                     </div>
                </div>

            </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Add Goal Modal */}
      {activeModal === 'ADD_GOAL' && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-6">
                  <h3 className="text-xl font-bold mb-4 text-purple-700">添加新梦想</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-sm font-bold text-gray-600">梦想名称</label>
                          <input type="text" className="w-full border rounded-lg p-2 mt-1" placeholder="例如: 买笔记本电脑" value={modalInputText} onChange={e => setModalInputText(e.target.value)} />
                      </div>
                      <div>
                          <label className="text-sm font-bold text-gray-600">需要金额</label>
                          <input type="number" className="w-full border rounded-lg p-2 mt-1" placeholder="¥" value={modalInputAmount} onChange={e => setModalInputAmount(e.target.value)} />
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                          <button onClick={closeModal} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">取消</button>
                          <button onClick={handleAddGoal} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold">添加</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 2. Spend Play Modal */}
      {activeModal === 'SPEND_PLAY' && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-6">
                  <h3 className="text-xl font-bold mb-4 text-pink-600">乐享支出</h3>
                  <div className="bg-pink-50 p-3 rounded-lg mb-4 text-sm text-pink-800">
                      当前乐享基金余额: ¥{state.playFund}
                  </div>
                  <div className="space-y-4">
                      <div>
                          <label className="text-sm font-bold text-gray-600">消费内容</label>
                          <input type="text" className="w-full border rounded-lg p-2 mt-1" placeholder="例如: 看电影" value={modalInputText} onChange={e => setModalInputText(e.target.value)} />
                      </div>
                      <div>
                          <label className="text-sm font-bold text-gray-600">消费金额</label>
                          <input type="number" className="w-full border rounded-lg p-2 mt-1" placeholder="¥" value={modalInputAmount} onChange={e => setModalInputAmount(e.target.value)} />
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                          <button onClick={closeModal} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">取消</button>
                          <button onClick={handleSpendPlay} className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-bold">确认支出</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 3. Realize Dream Modal */}
      {activeModal === 'REALIZE_DREAM' && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-6">
                  <h3 className="text-xl font-bold mb-4 text-purple-700">实现梦想 ✨</h3>
                  <div className="bg-purple-50 p-3 rounded-lg mb-4 text-sm text-purple-800">
                      当前梦想基金余额: ¥{state.dreamFund}
                  </div>
                  <div className="space-y-4">
                      <label className="text-sm font-bold text-gray-600">选择要实现的梦想</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                          {state.dreamGoals.filter(g => !g.isAchieved).map(goal => (
                              <div 
                                key={goal.id} 
                                onClick={() => setSelectedGoalId(goal.id)}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedGoalId === goal.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
                              >
                                  <div className="flex justify-between">
                                      <span className="font-bold text-gray-800">{goal.name}</span>
                                      <span className="text-purple-600">¥{goal.cost}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-6">
                          <button onClick={closeModal} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">再等等</button>
                          <button 
                            onClick={handleRealizeDream} 
                            disabled={!selectedGoalId}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold disabled:bg-gray-300"
                          >
                              实现它！
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
