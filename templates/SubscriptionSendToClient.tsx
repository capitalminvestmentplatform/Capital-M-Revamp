import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import Footer from "./Footer";

interface SubscriptionSendToClientEmailProps {
  username: string;
  title: string;
  productId: string;
  subscriptionUrl: string;
}

const SubscriptionSendToClient: React.FC<
  SubscriptionSendToClientEmailProps
> = ({ username, title, productId, subscriptionUrl }) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Subscription received for {title} - Capital M</Preview>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`https://res.cloudinary.com/dvm9wuu3f/image/upload/v1741172718/logo_gqnslm.png`}
              width="70"
              height="70"
              alt="Capital M"
            />
          </Section>

          <Text style={nameText}>Dear {username}</Text>

          <Text style={heroText}>
            The request for your subscription for the investment opportunity is
            created, this exclusive opportunity has the potential to enhance
            your investment portfolio and contribute to your financial growth.
            Don't miss out on this exciting venture!
          </Text>

          <Text style={text}>
            <span>{"Investment Details:"}</span>
          </Text>

          <Text style={text}>
            Investment Title:{" "}
            <span style={{ fontWeight: "bold" }}>{title}</span>
          </Text>
          <Text style={text}>
            Investment Id:{" "}
            <span style={{ fontWeight: "bold" }}>{productId}</span>
          </Text>

          {/* <Text style={text}>
            <span>To access your receipt, just click the button below:</span>
          </Text>

          <Button style={button} href={subscriptionUrl}>
            SIGN SUBSCRIPTION FORM
          </Button> */}

          <Text style={nameText}>
            Follow below instructions for manual subscription:
          </Text>

          <Text style={text}>
            <span>
              1. Log in to your Capital M account using your credentials.{" "}
            </span>
          </Text>
          <Text style={text}>
            <span>
              2. Navigate to the Subscriptions page from the main menu.{" "}
            </span>
          </Text>
          <Text style={text}>
            <span>
              3. Locate the specific subscription form and click on accept.{" "}
            </span>
          </Text>
          <Text style={text}>
            <span>
              4. Enter the desired investment amount and review the terms and
              conditions.{" "}
            </span>
          </Text>
          <Text style={text}>
            <span>
              5. Add/upload your signatures, Send to Admin and proceed with the
              Capital Call for payment process.{" "}
            </span>
          </Text>

          <Text style={text}>
            <span>
              Remember, this investment opportunity is available for a limited
              time only. Act swiftly to secure your participation before the
              subscription deadline.
            </span>
          </Text>

          <Text style={text}>
            If you have any questions, feel free to reach out. We're here to
            help!
          </Text>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
};

export default SubscriptionSendToClient;

const button = {
  backgroundColor: "#386264",
  color: "#ffffff",
  padding: "12px 20px",
  textDecoration: "none",
  borderRadius: "5px",
  display: "inline-block",
};

const main = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "0px 20px",
};

const logoContainer = {
  marginTop: "32px",
};

const heroText = {
  fontSize: "15px",
  lineHeight: "28px",
  marginBottom: "30px",
};
const text = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "24px",
};

const span = {
  fontWeight: "bold",
};

const nameText = {
  fontSize: "15px",
  lineHeight: "28px",
  marginBottom: "30px",
  fontWeight: "bold",
};
