import { useState, useEffect, useRef } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  style?: React.CSSProperties;
  allowClear?: boolean;
}

export default function SearchInput({
  value: externalValue,
  onChange,
  placeholder = 'Buscar...',
  debounceMs = 300,
  style,
  allowClear = true,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(externalValue || '');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (externalValue !== undefined) {
      setLocalValue(externalValue);
    }
  }, [externalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(val);
    }, debounceMs);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <Input
      prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
      placeholder={placeholder}
      value={localValue}
      onChange={handleChange}
      allowClear={allowClear}
      style={{ width: 280, ...style }}
    />
  );
}
