import {
    Body,
    Container,
    Column,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
  } from '@react-email/components';
  import * as React from 'react';
  
  export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  
  interface OrderStatusTemplateProps {
    customerName: string;
    orderNumber: string;
    orderDate: string;
    totalAmount: string;
    estimatedDelivery: string;
    orderDetailsLink: string;
    status: OrderStatus;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://freshacres.co.ke';
  
  // Status-specific content
  const statusContent = {
    PENDING: {
      title: 'Your Order Has Been Received',
      message: 'Thank you for your order. We\'ve received it and will begin processing it shortly.',
      color: '#F59E0B', // Amber
      emoji: '🕒',
    },
    PROCESSING: {
      title: 'Your Order Is Being Processed',
      message: 'Good news! We\'re currently preparing your items for shipment.',
      color: '#3B82F6', // Blue
      emoji: '⚙️',
    },
    SHIPPED: {
      title: 'Your Order Has Been Shipped',
      message: 'Your order is on its way to you! Track your delivery for the latest updates.',
      color: '#8B5CF6', // Purple
      emoji: '🚚',
    },
    DELIVERED: {
      title: 'Your Order Has Been Delivered',
      message: 'Your order has been delivered. We hope you enjoy your products!',
      color: '#10B981', // Green
      emoji: '✅',
    },
    CANCELLED: {
      title: 'Your Order Has Been Cancelled',
      message: 'Your order has been cancelled. If you have any questions, please contact our customer support.',
      color: '#EF4444', // Red
      emoji: '❌',
    },
  };
  
  export const OrderStatusTemplate = ({
    customerName,
    orderNumber,
    orderDate,
    totalAmount,
    estimatedDelivery,
    orderDetailsLink,
    status,
  }: OrderStatusTemplateProps) => {
    const { title, message, color, emoji } = statusContent[status];
  
    return (
      <Html>
        <Head>
          <title>{title}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />
        </Head>
        <Preview>{title} - Order #{orderNumber}</Preview>
        <Body style={main}>
          <Container style={container}>
            {/* Header */}
            <Section style={header}>
              <Img
                src={`https://res.cloudinary.com/dunssu2gi/image/upload/v1744530622/blog-images/bpqpxqml18kamrdmj2pp.png`}
                width="100"
                height="60"
                alt="Freshom Produce "
                style={logo}
              />
            </Section>
  
            {/* Status Banner */}
            {/* <Section style={{ ...statusBanner, backgroundColor: color }}>
              <Text style={statusText}>
                {emoji} {title}
              </Text>
            </Section>
   */}
            {/* Main Content */}
            <Section style={content}>
              <Text style={greeting}>Hello {customerName},</Text>
              <Text style={paragraph}>{message}</Text>
              
              {/* Order Details Card */}
              <Section style={orderCard}>
                <Heading as="h2" style={orderCardTitle}>
                  Order Summary
                </Heading>
                <Hr style={divider} />
                
                <Row style={orderDetail}>
                  <Column style={orderDetailLabel}>Order Number:</Column>
                  <Column style={orderDetailValue}>{orderNumber}</Column>
                </Row>
                
                <Row style={orderDetail}>
                  <Column style={orderDetailLabel}>Order Date:</Column>
                  <Column style={orderDetailValue}>{orderDate}</Column>
                </Row>
                
                <Row style={orderDetail}>
                  <Column style={orderDetailLabel}>Order Status:</Column>
                  <Column style={orderDetailValue}>
                    <Text style={{ ...statusBadge, backgroundColor: color }}>
                      {status}
                    </Text>
                  </Column>
                </Row>
                
                <Row style={orderDetail}>
                  <Column style={orderDetailLabel}>Total Amount:</Column>
                  <Column style={orderDetailValue}>{totalAmount}</Column>
                </Row>
                
                {status !== 'CANCELLED' && status !== 'DELIVERED' && (
                  <Row style={orderDetail}>
                    <Column style={orderDetailLabel}>Estimated Delivery:</Column>
                    <Column style={orderDetailValue}>{estimatedDelivery}</Column>
                  </Row>
                )}
              </Section>
  
              {/* CTA Button */}
              {/* <Section style={ctaContainer}>
                <Link href={orderDetailsLink} style={ctaButton}>
                  View Order Details
                </Link>
              </Section> */}
  
              {/* Additional Information */}
              <Text style={paragraph}>
                If you have any questions or need assistance, please don't hesitate to contact our customer support team.
              </Text>
              
              <Text style={paragraph}>
                Thank you for shopping with Freshom Produce Market!
              </Text>
              
              <Text style={signature}>
                The Freshom Produce Team
              </Text>
            </Section>
  
            {/* Footer */}
            <Section style={footer}>
              <Text style={footerText}>
                © {new Date().getFullYear()} Freshom Produce Market. All rights reserved.
              </Text>
              <Text style={footerSlogan}>
                Fresh From Nature Made For Home
              </Text>
              <Text style={footerLinks}>
                <Link href={`${baseUrl}/`} style={footerLink}>Contact Us</Link> • 
                <Link href={`${baseUrl}/`} style={footerLink}> Privacy Policy</Link> • 
                <Link href={`${baseUrl}/`} style={footerLink}> Terms of Service</Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  
  // Styles
  const main = {
    backgroundColor: '#f5f5f5',
    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#4B5563', // gray-700
  };
  
  const container = {
    margin: '0 auto',
    padding: '20px 0',
    maxWidth: '600px',
  };
  
  const header = {
    backgroundColor: '#ffffff',
    padding: '20px 30px',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    borderBottom: '1px solid #E5E7EB',
    textAlign: 'center' as const,
  };
  
  const logo = {
    margin: '0 auto',
  };
  
  const statusBanner = {
    padding: '15px',
    textAlign: 'center' as const,
  };
  
  const statusText = {
    fontSize: '16px',
    color: '#ffffff',
    fontWeight: '600',
    margin: '0',
  };
  
  const content = {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
  };
  
  const greeting = {
    fontSize: '18px',
    lineHeight: '24px',
    margin: '0 0 15px',
    color: '#0D4715', // Primary theme color
    fontWeight: '600',
  };
  
  const paragraph = {
    fontSize: '14px',
    lineHeight: '24px',
    margin: '0 0 20px',
  };
  
  const orderCard = {
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
    border: '1px solid #E5E7EB',
  };
  
  const orderCardTitle = {
    fontSize: '16px',
    color: '#0D4715', // Primary theme color
    margin: '0 0 15px',
    fontWeight: '600',
  };
  
  const divider = {
    borderColor: '#E5E7EB',
    margin: '15px 0',
  };
  
  const orderDetail = {
    margin: '10px 0',
  };
  
  const orderDetailLabel = {
    width: '40%',
    fontSize: '13px',
    color: '#6B7280',
    fontWeight: '500',
  };
  
  const orderDetailValue = {
    width: '60%',
    fontSize: '13px',
    fontWeight: '500',
  };
  
  const statusBadge = {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '500',
  };
  
  const ctaContainer = {
    textAlign: 'center' as const,
    margin: '30px 0',
  };
  
  const ctaButton = {
    backgroundColor: '#0D4715', // Primary theme color
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    display: 'inline-block',
  };
  
  const signature = {
    fontSize: '14px',
    color: '#0D4715', // Primary theme color
    fontWeight: '500',
    margin: '30px 0 0',
  };
  
  const footer = {
    textAlign: 'center' as const,
    padding: '20px 30px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    marginTop: '20px',
  };
  
  const footerText = {
    fontSize: '12px',
    color: '#6B7280',
    margin: '0 0 5px',
  };
  
  const footerSlogan = {
    fontSize: '12px',
    color: '#B17F59', // Secondary theme color
    fontWeight: '500',
    margin: '0 0 15px',
  };
  
  const footerLinks = {
    fontSize: '12px',
    color: '#6B7280',
  };
  
  const footerLink = {
    color: '#0D4715', // Primary theme color
    textDecoration: 'none',
  };
  
  export default OrderStatusTemplate;
  