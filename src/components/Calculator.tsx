'use client';

import { useState, useCallback, useEffect } from 'react';
import Display from './Display';
import Button from './Button';
import CalculationHistory from './CalculationHistory';
import styles from './Calculator.module.css';

type CalcHistory = { id: number; expression: string; result: string; createdAt: string };

const BUTTONS = [
  { label: 'C', type: 'special' },
  { label: '⌫', type: 'special' },
  { label: '%', type: 'special' },
  { label: '÷', type: 'operator' },
  { label: '7', type: 'digit' },
  { label: '8', type: 'digit' },
  { label: '9', type: 'digit' },
  { label: '×', type: 'operator' },
  { label: '4', type: 'digit' },
  { label: '5', type: 'digit' },
  { label: '6', type: 'digit' },
  { label: '-', type: 'operator' },
  { label: '1', type: 'digit' },
  { label: '2', type: 'digit' },
  { label: '3', type: 'digit' },
  { label: '+', type: 'operator' },
  { label: '+/-', type: 'special' },
  { label: '0', type: 'digit' },
  { label: '.', type: 'digit' },
  { label: '=', type: 'equals' },
];

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<CalcHistory[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/calculations');
      const data = await res.json();
      if (data.calculations) setHistory(data.calculations);
    } catch (e) {
      console.error('Failed to fetch history', e);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const saveCalculation = useCallback(async (expr: string, result: string) => {
    try {
      await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: expr, result }),
      });
      fetchHistory();
    } catch (e) {
      console.error('Failed to save calculation', e);
    }
  }, [fetchHistory]);

  const clearHistory = useCallback(async () => {
    try {
      await fetch('/api/calculations', { method: 'DELETE' });
      setHistory([]);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  }, []);

  const calculate = useCallback((a: string, op: string, b: string): string => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    switch (op) {
      case '+':
        return String(numA + numB);
      case '-':
        return String(numA - numB);
      case '×':
        return String(numA * numB);
      case '÷':
        if (numB === 0) throw new Error('Division by zero');
        return String(numA / numB);
      default:
        return b;
    }
  }, []);

  const formatResult = (val: string): string => {
    const num = parseFloat(val);
    if (isNaN(num)) return 'Error';
    if (Number.isInteger(num)) return String(num);
    return parseFloat(num.toFixed(10)).toString();
  };

  const handleButton = useCallback((label: string) => {
    setError(null);

    if (label === 'C') {
      setDisplay('0');
      setExpression('');
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(false);
      return;
    }

    if (label === '⌫') {
      if (waitingForOperand) return;
      const newDisplay = display.length > 1 ? display.slice(0, -1) : '0';
      setDisplay(newDisplay);
      return;
    }

    if (label === '%') {
      const val = parseFloat(display) / 100;
      const formatted = formatResult(String(val));
      setDisplay(formatted);
      return;
    }

    if (label === '+/-') {
      const val = parseFloat(display) * -1;
      setDisplay(String(val));
      return;
    }

    if (['+', '-', '×', '÷'].includes(label)) {
      if (prevValue !== null && operator && !waitingForOperand) {
        try {
          const result = calculate(prevValue, operator, display);
          const formatted = formatResult(result);
          const expr = `${prevValue} ${operator} ${display}`;
          setExpression(`${formatted} ${label}`);
          setPrevValue(formatted);
          setDisplay(formatted);
          saveCalculation(expr, formatted);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Error';
          setError(msg);
          setDisplay('Error');
          setPrevValue(null);
          setOperator(null);
          setWaitingForOperand(false);
          return;
        }
      } else {
        setPrevValue(display);
        setExpression(`${display} ${label}`);
      }
      setOperator(label);
      setWaitingForOperand(true);
      return;
    }

    if (label === '=') {
      if (prevValue !== null && operator) {
        try {
          const result = calculate(prevValue, operator, display);
          const formatted = formatResult(result);
          const expr = `${prevValue} ${operator} ${display}`;
          setExpression(`${expr} =`);
          setDisplay(formatted);
          saveCalculation(expr, formatted);
          setPrevValue(null);
          setOperator(null);
          setWaitingForOperand(true);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Error';
          setError(msg);
          setDisplay('Error');
          setExpression('');
          setPrevValue(null);
          setOperator(null);
          setWaitingForOperand(false);
        }
      }
      return;
    }

    // Digit or decimal
    if (label === '.') {
      if (waitingForOperand) {
        setDisplay('0.');
        setWaitingForOperand(false);
        return;
      }
      if (!display.includes('.')) {
        setDisplay(display + '.');
      }
      return;
    }

    if (waitingForOperand) {
      setDisplay(label);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? label : display + label);
    }
  }, [display, prevValue, operator, waitingForOperand, calculate, saveCalculation]);

  const handleHistoryClick = useCallback((result: string) => {
    setDisplay(result);
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setExpression('');
    setError(null);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.calculatorContainer}>
        <Display display={display} expression={expression} error={error} />
        <div className={styles.grid}>
          {BUTTONS.map((btn) => (
            <Button
              key={btn.label}
              label={btn.label}
              type={btn.type as 'digit' | 'operator' | 'special' | 'equals'}
              onClick={() => handleButton(btn.label)}
            />
          ))}
        </div>
      </div>

      <div className={styles.historySection}>
        <div className={styles.historyHeader}>
          <span>History</span>
          <div className={styles.historyActions}>
            <button
              className={styles.toggleBtn}
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide' : 'Show'}
            </button>
            {history.length > 0 && (
              <button className={styles.clearBtn} onClick={clearHistory}>
                Clear
              </button>
            )}
          </div>
        </div>
        {showHistory && (
          <CalculationHistory history={history} onSelect={handleHistoryClick} />
        )}
      </div>
    </div>
  );
}
