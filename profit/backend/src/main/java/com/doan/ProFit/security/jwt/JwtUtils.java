package com.doan.ProFit.security.jwt;

import com.doan.ProFit.security.service.UserDetailsImpl;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
	private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);
	private static final String JWT_COOKIE_NAME = "admin_token";
	private static final String BEARER_PREFIX = "Bearer ";

	@Value("${app.jwt.secret}")
	private String jwtSecret;

	@Value("${app.jwt.expiration-ms:86400000}")
	private long jwtExpirationMs;

	@Value("${app.jwt.remember-expiration-ms:604800000}")
	private long jwtRememberExpirationMs;

	public String generateJwtToken(UserDetailsImpl userPrincipal, boolean rememberMe) {
		Date now = new Date();
		long expiration = rememberMe ? jwtRememberExpirationMs : jwtExpirationMs;
		Date expiryDate = new Date(now.getTime() + expiration);

		return Jwts.builder()
				.setSubject(userPrincipal.getUsername())
				.claim("role", userPrincipal.getAuthorities().iterator().next().getAuthority())
				.setIssuedAt(now)
				.setExpiration(expiryDate)
				.signWith(getSigningKey(), SignatureAlgorithm.HS512)
				.compact();
	}

	public String getUserNameFromJwtToken(String token) {
		return Jwts.parserBuilder()
				.setSigningKey(getSigningKey())
				.build()
				.parseClaimsJws(token)
				.getBody()
				.getSubject();
	}

	public boolean validateJwtToken(String authToken) {
		try {
			logger.debug("Validating JWT token (length={})", authToken.length());
			Claims claims = Jwts.parserBuilder()
					.setSigningKey(getSigningKey())
					.build()
					.parseClaimsJws(authToken)
					.getBody();
			
			Date expiration = claims.getExpiration();
			boolean isExpired = expiration.before(new Date());
			logger.debug("JWT expiration: {}, isExpired: {}", expiration, isExpired);
			
			return !isExpired;
		} catch (Exception e) {
			logger.error("JWT validation failed: {} - {}", e.getClass().getSimpleName(), e.getMessage());
			return false;
		}
	}

	public String getJwtFromRequest(HttpServletRequest request) {
		String headerAuth = request.getHeader(HttpHeaders.AUTHORIZATION);
		logger.debug("Authorization header: {}", headerAuth);
		
		if (StringUtils.hasText(headerAuth) && headerAuth.startsWith(BEARER_PREFIX)) {
			String jwt = headerAuth.substring(BEARER_PREFIX.length());
			logger.debug("JWT extracted from header (length={}): {}", jwt.length(), jwt.substring(0, Math.min(50, jwt.length())) + "...");
			return jwt;
		}

		String cookieJwt = getJwtFromCookies(request);
		logger.debug("JWT from cookies: {}", cookieJwt != null ? "present" : "null");
		return cookieJwt;
	}

	public String getJwtFromCookies(HttpServletRequest request) {
		Cookie[] cookies = request.getCookies();
		if (cookies == null || cookies.length == 0) {
			return null;
		}

		for (Cookie cookie : cookies) {
			if (JWT_COOKIE_NAME.equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
				return cookie.getValue();
			}
		}

		return null;
	}

	public String getJwtCookieName() {
		return JWT_COOKIE_NAME;
	}

	public long getJwtExpirationMs(boolean rememberMe) {
		return rememberMe ? jwtRememberExpirationMs : jwtExpirationMs;
	}

	private Key getSigningKey() {
		return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
	}
}
