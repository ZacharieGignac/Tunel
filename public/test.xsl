<html xsl:version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<body>
<xsl:for-each select="Extensions/Panel">
    Panel Id: <xsl:value-of select="PanelId"/><br/>
    Panel Name: <xsl:value-of select="Name"/><br/><br/>
    <xsl:for-each select="Page">
        <b>Page Name: <xsl:value-of select="Name"/></b><br/><br/>
        <xsl:for-each select="Row">
            <b>Row: </b> <xsl:value-of select="Name"/><br/>
            <xsl:for-each select="Widget">
                <span style="margin-left:20px;">WidgetId:</span><xsl:value-of select="WidgetId"/><br/>
                <span style="margin-left:20px;">Type:</span><xsl:value-of select="Type"/><br/>
                    <xsl:if test="Type = 'ToggleButton'">
                        <button name="test">test</button>
                    </xsl:if>
                    <xsl:if test="Type = 'GroupButton'">
                        <xsl:for-each select="ValueSpace/Value">
                            <span style="margin-left:40px"><xsl:value-of select="Name"/> = <xsl:value-of select="Key"/></span><br/>
                        </xsl:for-each>
                    </xsl:if>
                    <xsl:if test="Type = 'Button'">
                        Real HTML button: <Button id="{WidgetId}"><xsl:value-of select="Name"/></Button>
                    </xsl:if>
            </xsl:for-each><br/>
        </xsl:for-each>
        <br/><br/><br/>
    </xsl:for-each>
    <hr/>
</xsl:for-each>
</body>
</html>