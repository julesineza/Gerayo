import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

export default function WalletModal({ visible, onClose }) {
  const [addingCard, setAddingCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', type: 'card', name: 'Visa Personal', details: '•••• •••• •••• 4242', active: true },
    { id: '2', type: 'applepay', name: 'Apple Pay', details: 'Default Wallet', active: false },
    { id: '3', type: 'mobile', name: 'M-Pesa Wallet', details: '+250 788 123 456', active: false },
  ]);

  const [transactions, setTransactions] = useState([
    { id: '1', desc: 'Trip #1024 to Nyarutarama', amount: -25.00, date: 'Today, 10:45 PM', type: 'ride' },
    { id: '2', desc: 'Loaded Wallet via Mobile Money', amount: 50.00, date: 'Yesterday, 6:30 PM', type: 'load' },
    { id: '3', desc: 'Trip #1019 to Kiyovu', amount: -18.50, date: '14 July, 11:15 PM', type: 'ride' },
    { id: '4', desc: 'Weekly Driver Payout', amount: 320.00, date: '12 July, 9:00 AM', type: 'payout' },
  ]);

  const handleAddCard = () => {
    if (!cardNumber || !expiry || !cvv) {
      alert('Please fill out all card fields.');
      return;
    }
    const lastFour = cardNumber.slice(-4) || '9999';
    const newMethod = {
      id: String(paymentMethods.length + 1),
      type: 'card',
      name: 'Visa Added',
      details: `•••• •••• •••• ${lastFour}`,
      active: false,
    };
    setPaymentMethods([...paymentMethods, newMethod]);
    setAddingCard(false);
    setCardNumber('');
    setExpiry('');
    setCvv('');
  };

  const selectMethod = (id) => {
    setPaymentMethods(paymentMethods.map(m => ({ ...m, active: m.id === id })));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="wallet-sharp" size={22} color={COLORS.primary} />
              <Text style={styles.headerTitle}>Gerayo Premium Wallet</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>CURRENT BALANCE</Text>
                <Text style={styles.cardLogo}>GERAYO PREMIUM</Text>
              </View>
              <Text style={styles.balanceText}>$56.50</Text>
              <View style={styles.cardNumberContainer}>
                <Text style={styles.cardNumberText}>MEMBER ID: GR-9082-990</Text>
                <FontAwesome name="cc-visa" size={24} color={COLORS.white} style={{ opacity: 0.8 }} />
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="add-circle" size={20} color={COLORS.black} />
                <Text style={styles.actionBtnText}>Add Funds</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnSecondary}>
                <Ionicons name="arrow-redo" size={20} color={COLORS.primary} />
                <Text style={styles.actionBtnSecondaryText}>Send Receipt</Text>
              </TouchableOpacity>
            </View>

            {/* Payment Methods */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment Methods</Text>
              {!addingCard && (
                <TouchableOpacity onPress={() => setAddingCard(true)}>
                  <Text style={styles.addBtnText}>+ Add New</Text>
                </TouchableOpacity>
              )}
            </View>

            {addingCard ? (
              <View style={styles.addCardForm}>
                <Text style={styles.formTitle}>Add Credit/Debit Card</Text>
                <TextInput
                  placeholder="Card Number (16 digits)"
                  placeholderTextColor={COLORS.textSecondary}
                  style={styles.input}
                  keyboardType="numeric"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                />
                <View style={styles.formRow}>
                  <TextInput
                    placeholder="MM/YY"
                    placeholderTextColor={COLORS.textSecondary}
                    style={[styles.input, { flex: 1, marginRight: 10 }]}
                    keyboardType="numeric"
                    value={expiry}
                    onChangeText={setExpiry}
                  />
                  <TextInput
                    placeholder="CVV"
                    placeholderTextColor={COLORS.textSecondary}
                    style={[styles.input, { flex: 1 }]}
                    keyboardType="numeric"
                    value={cvv}
                    secureTextEntry={true}
                    onChangeText={setCvv}
                  />
                </View>
                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.cancelFormBtn} onPress={() => setAddingCard(false)}>
                    <Text style={styles.cancelFormText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveFormBtn} onPress={handleAddCard}>
                    <Text style={styles.saveFormText}>Save Card</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.paymentList}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[styles.paymentItem, method.active && styles.activePaymentItem]}
                    onPress={() => selectMethod(method.id)}
                  >
                    <View style={styles.paymentLeft}>
                      {method.type === 'card' && <Ionicons name="card" size={20} color={COLORS.primary} />}
                      {method.type === 'applepay' && <Ionicons name="logo-apple" size={20} color={COLORS.white} />}
                      {method.type === 'mobile' && <MaterialCommunityIcons name="cellphone-iphone" size={20} color={COLORS.secondary} />}
                      <View style={styles.paymentDetails}>
                        <Text style={styles.paymentName}>{method.name}</Text>
                        <Text style={styles.paymentSub}>{method.details}</Text>
                      </View>
                    </View>
                    <View style={[styles.radioCircle, method.active && styles.radioActive]}>
                      {method.active && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Transactions */}
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <View style={styles.transactionList}>
              {transactions.map((tx) => (
                <View key={tx.id} style={styles.txItem}>
                  <View style={styles.txLeft}>
                    <View style={[
                      styles.txIconContainer,
                      tx.amount > 0 ? styles.txIconCredit : styles.txIconDebit
                    ]}>
                      <Ionicons
                        name={tx.amount > 0 ? "arrow-down-outline" : "arrow-up-outline"}
                        size={16}
                        color={tx.amount > 0 ? COLORS.success : COLORS.danger}
                      />
                    </View>
                    <View style={styles.txDetails}>
                      <Text style={styles.txDesc}>{tx.desc}</Text>
                      <Text style={styles.txDate}>{tx.date}</Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.txAmountText,
                    tx.amount > 0 ? styles.txCreditText : styles.txDebitText
                  ]}>
                    {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
  },
  scrollBody: {
    padding: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardLogo: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  balanceText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 20,
  },
  cardNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumberText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 10,
    height: 48,
  },
  actionBtnText: {
    color: COLORS.black,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionBtnSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    height: 48,
  },
  actionBtnSecondaryText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 10,
    marginBottom: 15,
  },
  addBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  paymentList: {
    marginBottom: 25,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    height: 60,
  },
  activePaymentItem: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255,184,0,0.05)',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentDetails: {
    marginLeft: 15,
  },
  paymentName: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  paymentSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  addCardForm: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 25,
  },
  formTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 15,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    color: COLORS.white,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelFormBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  cancelFormText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  saveFormBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveFormText: {
    color: COLORS.black,
    fontWeight: 'bold',
  },
  transactionList: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txIconCredit: {
    backgroundColor: 'rgba(48,209,88,0.1)',
  },
  txIconDebit: {
    backgroundColor: 'rgba(255,69,58,0.1)',
  },
  txDetails: {
    marginLeft: 12,
  },
  txDesc: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  txDate: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  txAmountText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  txCreditText: {
    color: COLORS.success,
  },
  txDebitText: {
    color: COLORS.textPrimary,
  },
});
