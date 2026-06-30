import { useState } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface RepairCost {
  item: string;
  quantity: number;
  unitCost: number;
  total: number;
}

interface EstimationData {
  method: 'cost_based' | 'market_based' | 'depreciation';
  baseValue: number;
  depreciation: number;
  repairCosts: RepairCost[];
}

interface EstimationCalculatorProps {
  data: EstimationData;
  onChange: (data: EstimationData) => void;
}

export function EstimationCalculator({ data, onChange }: EstimationCalculatorProps) {
  const { showToast } = useNotification();
  const [newCost, setNewCost] = useState<RepairCost>({
    item: '',
    quantity: 1,
    unitCost: 0,
    total: 0,
  });

  const addCost = () => {
    if (!newCost.item) {
      showToast('Veuillez saisir une description', 'error');
      return;
    }

    const cost: RepairCost = {
      ...newCost,
      total: newCost.quantity * newCost.unitCost,
    };

    onChange({
      ...data,
      repairCosts: [...data.repairCosts, cost],
    });

    setNewCost({
      item: '',
      quantity: 1,
      unitCost: 0,
      total: 0,
    });
  };

  const removeCost = (index: number) => {
    onChange({
      ...data,
      repairCosts: data.repairCosts.filter((_, i) => i !== index),
    });
  };

  const totalCost = data.repairCosts.reduce((sum, cost) => sum + cost.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Méthode d'estimation
        </label>
        <select
          value={data.method}
          onChange={(e) => onChange({ ...data, method: e.target.value as any })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="cost_based">Basée sur les coûts de réparation</option>
          <option value="market_based">Basée sur la valeur de marché</option>
          <option value="depreciation">Basée sur la dépréciation</option>
        </select>
      </div>

      {data.method === 'market_based' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Valeur de base (EUR)
          </label>
          <input
            type="number"
            value={data.baseValue}
            onChange={(e) => onChange({ ...data, baseValue: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {data.method === 'depreciation' && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Valeur de base (EUR)
            </label>
            <input
              type="number"
              value={data.baseValue}
              onChange={(e) => onChange({ ...data, baseValue: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Dépréciation (%)
            </label>
            <input
              type="number"
              value={data.depreciation}
              onChange={(e) => onChange({ ...data, depreciation: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </>
      )}

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          <span>Coûts de réparation</span>
        </h3>

        {data.repairCosts.length > 0 && (
          <div className="mb-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Description</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Quantité</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Coût unitaire</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {data.repairCosts.map((cost, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="px-4 py-3">{cost.item}</td>
                    <td className="px-4 py-3 text-right">{cost.quantity}</td>
                    <td className="px-4 py-3 text-right">{cost.unitCost.toFixed(2)} EUR</td>
                    <td className="px-4 py-3 text-right font-semibold">{cost.total.toFixed(2)} EUR</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeCost(index)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-semibold">
                  <td className="px-4 py-3" colSpan={3}>TOTAL</td>
                  <td className="px-4 py-3 text-right text-lg text-blue-600">{totalCost.toFixed(2)} EUR</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Ajouter un poste de coût</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              value={newCost.item}
              onChange={(e) => setNewCost({ ...newCost, item: e.target.value })}
              placeholder="Description"
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              value={newCost.quantity}
              onChange={(e) => setNewCost({ ...newCost, quantity: parseFloat(e.target.value) || 0 })}
              placeholder="Quantité"
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              value={newCost.unitCost}
              onChange={(e) => setNewCost({ ...newCost, unitCost: parseFloat(e.target.value) || 0 })}
              placeholder="Coût unitaire (EUR)"
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={addCost}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
