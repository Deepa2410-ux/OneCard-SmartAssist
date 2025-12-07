import React from "@react-pdf/renderer";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
  title: { fontSize: 20, marginBottom: 10, fontWeight: "bold" },
  section: { marginBottom: 15 },
  rowHeader: { flexDirection: "row", fontWeight: "bold", marginBottom: 5 },
  row: { flexDirection: "row", marginBottom: 3 },
  colDate: { width: "25%" },
  colMerchant: { width: "40%" },
  colAmount: { width: "35%", textAlign: "right" }
});

export default function StatementPDF({ user }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Credit Card Statement</Text>

        <Text>Name: {user.name}</Text>
        <Text>Card Number: **** **** **** {user.cardLast4}</Text>
        <Text>Phone: {user.phone}</Text>
        <Text>Billing Month: December 2025</Text>

        <View style={styles.section}>
          <Text style={{ marginTop: 10, fontSize: 14, fontWeight: "bold" }}>
            Transactions
          </Text>
          <View style={styles.rowHeader}>
            <Text style={styles.colDate}>Date</Text>
            <Text style={styles.colMerchant}>Merchant</Text>
            <Text style={styles.colAmount}>Amount (₹)</Text>
          </View>

          {user.transactions.map((t, index) => (
            <View style={styles.row} key={index}>
              <Text style={styles.colDate}>{t.date}</Text>
              <Text style={styles.colMerchant}>{t.merchant}</Text>
              <Text style={styles.colAmount}>{t.amount}</Text>
            </View>
          ))}
        </View>

        <Text style={{ marginTop: 10 }}>
          This document is system-generated and does not require a signature.
        </Text>
      </Page>
    </Document>
  );
}
