import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function OrderTrackingScreen() {
  // Mock tracking data
  const orders = [
    {
      id: '#MP-1042',
      date: '10 Oct 2024',
      status: 'En Preparación', // Pendiente, En Preparación, Enviado, Entregado
      total: 10500,
      items: '2x Galletón Avena, 1x Twix Tiramisú'
    },
    {
      id: '#MP-0988',
      date: '05 Oct 2024',
      status: 'Entregado',
      total: 4500,
      items: '1x Barra Coco'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pendiente': return '#f39c12';
      case 'En Preparación': return '#3498db';
      case 'Enviado': return '#9b59b6';
      case 'Entregado': return '#2ecc71';
      default: return '#fff';
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>{item.id}</Text>
        <Text style={styles.orderDate}>{item.date}</Text>
      </View>
      <Text style={styles.orderItems}>{item.items}</Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Total: ${item.total}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estado de Pedidos</Text>
      <FlatList 
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  orderCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 15,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orderDate: {
    color: '#aaa',
    fontSize: 14,
  },
  orderItems: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  orderTotal: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  }
});
