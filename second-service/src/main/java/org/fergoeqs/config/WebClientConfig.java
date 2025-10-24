package org.fergoeqs.config;

import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import javax.net.ssl.TrustManagerFactory;
import java.io.InputStream;
import java.security.KeyStore;

@Configuration
@RequiredArgsConstructor
public class WebClientConfig {

    @Value("${first-service.base-url}")
    private String firstServiceBaseUrl;

    @Value("${first-service.trust-store}")
    private String trustStorePath;

    @Value("${first-service.trust-store-password}")
    private String trustStorePassword;

    @Bean
    public WebClient webClient() throws Exception {

        KeyStore trustStore = KeyStore.getInstance("PKCS12");
        try (InputStream ts = new ClassPathResource(trustStorePath.replace("classpath:", "")).getInputStream()) {
            trustStore.load(ts, trustStorePassword.toCharArray());
        }

        TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        tmf.init(trustStore);

        SslContext sslContext = SslContextBuilder.forClient()
                .trustManager(tmf)
                .build();

        HttpClient httpClient = HttpClient.create()
                .secure(spec -> spec.sslContext(sslContext));

        return WebClient.builder()
                .baseUrl(firstServiceBaseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
}
