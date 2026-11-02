import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_URL } from './config';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Other'];

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [editingId, setEditingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [listRes, summaryRes] = await Promise.all([
        fetch(`${API_URL}/api/expenses`),
        fetch(`${API_URL}/api/expenses/summary`),
      ]);
      setExpenses(await listRes.json());
      const summary = await summaryRes.json();
      setTotal(summary.total);
    } catch (err) {
      console.log('Error loading data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('Food');
    setEditingId(null);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setAmount(String(item.amount));
    setCategory(item.category);
  };

  const saveExpense = async () => {
    const value = parseFloat(amount);
    if (!title.trim() || Number.isNaN(value) || value <= 0) {
      Alert.alert('Invalid input', 'Enter a title and an amount greater than 0.');
      return;
    }

    const isEditing = editingId !== null;
    const url = isEditing
      ? `${API_URL}/api/expenses/${editingId}`
      : `${API_URL}/api/expenses`;

    try {
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), amount: value, category }),
      });
      if (!res.ok) throw new Error('Request failed');

      resetForm();
      loadData();
    } catch (err) {
      Alert.alert('Error', 'Could not save the expense. Is the server running?');
    }
  };

  const deleteExpense = (id) => {
    Alert.alert('Delete expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/api/expenses/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Request failed');
            if (editingId === id) resetForm();
            loadData();
          } catch (err) {
            Alert.alert('Error', 'Could not delete the expense.');
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Total spent</Text>
        <Text style={styles.headerTotal}>${total.toFixed(2)}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formHeading}>
          {editingId !== null ? 'Edit expense' : 'New expense'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="What did you buy?"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
        <View style={styles.chips}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, category === c && styles.chipActive]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.addButton} onPress={saveExpense}>
          <Text style={styles.addButtonText}>
            {editingId !== null ? 'Save changes' : 'Add expense'}
          </Text>
        </TouchableOpacity>
        {editingId !== null && (
          <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No expenses yet.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.item, editingId === item.id && styles.itemEditing]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => startEdit(item)}>
              <Text style={styles.title}>{item.title}</Text>
              <Text>{item.category} · {item.date}</Text>
              <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteExpense(item.id)}>
              <Text style={styles.delete}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const NAVY = '#1f3a5f';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { backgroundColor: NAVY, paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  headerLabel: { color: '#c9d6e8', fontSize: 14 },
  headerTotal: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  form: { backgroundColor: '#fff', padding: 16 },
  formHeading: { fontSize: 16, fontWeight: '700', color: NAVY, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#d5dbe3',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  chip: {
    borderWidth: 1,
    borderColor: NAVY,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: NAVY },
  chipText: { color: NAVY },
  chipTextActive: { color: '#fff' },
  addButton: { backgroundColor: NAVY, padding: 14, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelButton: { padding: 12, alignItems: 'center' },
  cancelText: { color: NAVY, fontWeight: '600' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemEditing: { borderColor: NAVY },
  delete: { color: '#c0392b', fontSize: 22, paddingHorizontal: 8 },
  title: { fontSize: 18, fontWeight: '600' },
  amount: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  empty: { textAlign: 'center', color: '#6b7685', marginTop: 24 },
});