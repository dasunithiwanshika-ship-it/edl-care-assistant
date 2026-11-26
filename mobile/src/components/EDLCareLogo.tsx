import React from "react";
import { View, Image, StyleSheet, StyleProp, ViewStyle, ImageStyle } from "react-native";
import { Colors } from "../theme/colors";

export type EDLCareLogoVariant = "full" | "badge" | "circle" | "bubble-avatar" | "emblem";

interface EDLCareLogoProps {
  variant?: EDLCareLogoVariant;
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

export const EDLCareLogo: React.FC<EDLCareLogoProps> = ({
  variant = "full",
  size,
  style,
  imageStyle,
}) => {
  switch (variant) {
    case "circle": {
      // Large circular robot avatar orb matching screenshot
      const d = size || 82;
      return (
        <View
          style={[
            styles.robotOrbContainer,
            { width: d, height: d, borderRadius: d / 2 },
            style,
          ]}
        >
          <Image
            source={require("../../assets/edl-robot-orb.png")}
            style={[
              { width: d, height: d, borderRadius: d / 2 },
              imageStyle,
            ]}
            resizeMode="contain"
          />
        </View>
      );
    }

    case "bubble-avatar": {
      // Small circular avatar icon beside assistant messages in chat stream
      const d = size || 36;
      return (
        <View
          style={[
            styles.bubbleAvatarContainer,
            { width: d, height: d, borderRadius: d / 2 },
            style,
          ]}
        >
          <Image
            source={require("../../assets/edl-agent-avatar.png")}
            style={[
              { width: d, height: d, borderRadius: d / 2 },
              imageStyle,
            ]}
            resizeMode="contain"
          />
        </View>
      );
    }

    case "badge": {
      // Rounded card / pill with clean white background for banners
      const w = size ? size * 2.8 : 220;
      const h = size || 72;
      return (
        <View style={[styles.badgeContainer, { width: w, height: h }, style]}>
          <Image
            source={require("../../assets/edlcare-logo.png")}
            style={[{ width: w - 24, height: h - 16 }, imageStyle]}
            resizeMode="contain"
          />
        </View>
      );
    }

    case "emblem": {
      const d = size || 40;
      return (
        <View style={[styles.emblemContainer, style]}>
          <Image
            source={require("../../assets/edlcare-emblem.png")}
            style={[{ width: d, height: d * 0.92 }, imageStyle]}
            resizeMode="contain"
          />
        </View>
      );
    }

    case "full":
    default: {
      const w = size ? size * 3.0 : 200;
      const h = size || 64;
      return (
        <View style={[styles.fullContainer, style]}>
          <Image
            source={require("../../assets/edlcare-logo.png")}
            style={[{ width: w, height: h }, imageStyle]}
            resizeMode="contain"
          />
        </View>
      );
    }
  }
};

const styles = StyleSheet.create({
  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  robotOrbContainer: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF8DA1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  bubbleAvatarContainer: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#650B24",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  fullContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  emblemContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
